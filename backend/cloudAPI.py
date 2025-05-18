from flask import Flask, request, jsonify, redirect
import face_recognition
from flask_cors import CORS
import os
import pickle
from PIL import Image, ExifTags
import numpy as np
from concurrent.futures import ThreadPoolExecutor
import cloudinary
import cloudinary.uploader
import cloudinary.api
import tempfile
import io
import uuid
from urllib.request import urlopen

print("API initializing...")

app = Flask(__name__)
CORS(app)

# Cloudinary Configuration
cloudinary.config(
    cloud_name="....",
    api_key="....",
    api_secret="...."
)

# Configuration
GROUP_PHOTOS_FOLDER = 'group_imgs'  # Cloudinary folder for group images
CACHE_FOLDER = 'group_encodings_cache'  # Cloudinary folder for encodings
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
DEFAULT_TOLERANCE = 0.50
MAX_IMAGE_DIMENSION = 800
FACE_DETECTION_MODEL = 'hog'  # Use 'cnn' for better accuracy but slower performance

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def handle_exif_rotation(image):
    """Apply EXIF orientation rotation if needed"""
    try:
        exif = image.getexif()
        if not exif:
            return image

        orientation = None
        for tag, value in exif.items():
            if ExifTags.TAGS.get(tag) == 'Orientation':
                orientation = value
                break

        if orientation:
            if orientation == 3:
                image = image.transpose(Image.Transpose.ROTATE_180)
            elif orientation == 6:
                image = image.transpose(Image.Transpose.ROTATE_270)
            elif orientation == 8:
                image = image.transpose(Image.Transpose.ROTATE_90)
    except Exception as e:
        print(f"Error handling EXIF data: {str(e)}")
    
    return image

def load_and_preprocess_image(file_stream):
    """Load image from file stream and apply preprocessing"""
    try:
        image = Image.open(file_stream)
        image = handle_exif_rotation(image)
        
        # Convert to RGB if needed
        if image.mode != 'RGB':
            image = image.convert('RGB')
            
        # Resize large images
        width, height = image.size
        if max(width, height) > MAX_IMAGE_DIMENSION:
            ratio = MAX_IMAGE_DIMENSION / max(width, height)
            new_size = (int(width * ratio), int(height * ratio))
            image = image.resize(new_size, Image.Resampling.LANCZOS)
            
        return np.array(image)
    except Exception as e:
        print(f"Error loading image: {str(e)}")
        raise

def get_image_from_cloudinary(public_id):
    """Retrieve image from Cloudinary and convert to numpy array"""
    try:
        # Get image URL
        result = cloudinary.api.resource(public_id)
        image_url = result['secure_url']
        
        # Download image
        with urlopen(image_url) as response:
            image_data = response.read()
        
        # Convert to PIL Image
        image = Image.open(io.BytesIO(image_data))
        image = handle_exif_rotation(image)
        
        # Convert to RGB if needed
        if image.mode != 'RGB':
            image = image.convert('RGB')
            
        return np.array(image)
    except Exception as e:
        print(f"Error retrieving image from Cloudinary: {str(e)}")
        raise

def check_encoding_cache(image_name):
    """Check if encoding cache exists for image"""
    cache_name = f"{image_name}.pkl"
    public_id = f"{CACHE_FOLDER}/{cache_name}"
    
    try:
        # Check if cache exists
        cloudinary.api.resource(public_id)
        return True
    except cloudinary.exceptions.NotFound:
        return False
    except Exception as e:
        print(f"Error checking cache: {str(e)}")
        return False

def get_cached_encoding(image_name):
    cache_name = f"{image_name}.pkl"
    public_id = f"{CACHE_FOLDER}/{cache_name}"
    
    try:
        # Check if cache exists (avoid 404)
        try:
            cloudinary.api.resource(public_id, resource_type="raw")
        except cloudinary.exceptions.NotFound:
            print(f"Cache not found: {public_id}")  # Debug
            return None
        
        # Download cache
        url = cloudinary.utils.cloudinary_url(public_id, resource_type="raw")[0]
        with urlopen(url) as response:
            return pickle.loads(response.read())
            
    except Exception as e:
        print(f"Error getting cached encoding (public_id={public_id}): {str(e)}")
        return None

def save_encoding_to_cache(image_name, face_encodings):
    """Save face encodings to Cloudinary cache"""
    cache_name = f"{image_name}.pkl"
    public_id = f"{CACHE_FOLDER}/{cache_name}"
    
    try:
        # Serialize the face encodings
        pickle_data = pickle.dumps(face_encodings)
        
        print(f"Saving {cache_name} to Cloudinary...")
        # Upload to Cloudinary
        result = cloudinary.uploader.upload(
            pickle_data,
            public_id=public_id,
            resource_type="raw"
        )
        return result['public_id']
    except Exception as e:
        print(f"Error saving encoding to cache: {str(e)}")
        return None

def process_and_cache_image(image_public_id, image_name, force_update=False):
    """Process an image and cache its face encodings"""
    try:
        # Skip if cache exists and force_update is False
        if not force_update and check_encoding_cache(image_name):
            return True
        
        # Get image from Cloudinary
        image_np = get_image_from_cloudinary(image_public_id)

        # Detect faces
        face_locations = face_recognition.face_locations(
            image_np, 
            model=FACE_DETECTION_MODEL,
            number_of_times_to_upsample=1
        )
        face_encodings = face_recognition.face_encodings(image_np, face_locations)

        # Save to cache
        return save_encoding_to_cache(image_name, face_encodings)

    except Exception as e:
        print(f"Error processing {image_name}: {str(e)}")
        return False

# Initialize cached images on startup
print("Initializing Cloudinary resources...")
try:
    # Create folders if they don't exist
    try:
        cloudinary.api.create_folder(GROUP_PHOTOS_FOLDER)
    except:
        pass
    
    try:
        cloudinary.api.create_folder(CACHE_FOLDER)
    except:
        pass
    
    # Check existing images and cache them
    print("Checking existing images for caching...")
    result = cloudinary.api.resources(
        type="upload",
        prefix=GROUP_PHOTOS_FOLDER,
        max_results=500
    )
    
    for resource in result.get('resources', []):
        public_id = resource['public_id']
        image_name = os.path.basename(public_id)
        if "." in image_name and image_name.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS:
            if not check_encoding_cache(image_name):
                print(f"Pre-caching {image_name}...")
                process_and_cache_image(public_id, image_name)
except Exception as e:
    print(f"Error initializing Cloudinary resources: {str(e)}")

@app.route('/upload-group-photo', methods=['POST'])
def upload_group_photo():
    """Upload a new group photo and update cache"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '' or not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file'}), 400

    try:
        # Generate a unique ID for the file to avoid duplicates
        unique_filename = f"{uuid.uuid4()}_{file.filename}"
        public_id = f"{GROUP_PHOTOS_FOLDER}/{unique_filename}"
        
        # Upload to Cloudinary
        result = cloudinary.uploader.upload(
            file,
            public_id=public_id,
            resource_type="image"
        )
        
        # Process and cache image
        process_and_cache_image(result['public_id'], unique_filename)
        
        return jsonify({
            'message': 'Group photo uploaded and processed',
            'filename': unique_filename,
            'url': result['secure_url']
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/upload-bulk-group-photos', methods=['POST'])
def upload_bulk_group_photos():
    """Upload multiple group photos at once and update cache"""
    if 'files' not in request.files:
        return jsonify({'error': 'No files provided'}), 400
    
    files = request.files.getlist('files')
    if not files or files[0].filename == '':
        return jsonify({'error': 'No selected files'}), 400

    uploaded_files = []
    errors = []

    for file in files:
        if not allowed_file(file.filename):
            errors.append({'filename': file.filename, 'error': 'Invalid file type'})
            continue

        try:
            # Generate a unique ID for the file
            unique_filename = f"{uuid.uuid4()}_{file.filename}"
            public_id = f"{GROUP_PHOTOS_FOLDER}/{unique_filename}"
            
            # Upload to Cloudinary
            result = cloudinary.uploader.upload(
                file,
                public_id=public_id,
                resource_type="image"
            )
            
            # Process and cache image
            process_and_cache_image(result['public_id'], unique_filename)
            
            uploaded_files.append({
                'filename': unique_filename,
                'url': result['secure_url']
            })
        except Exception as e:
            errors.append({'filename': file.filename, 'error': str(e)})

    response = {
        'message': 'Bulk upload processed',
        'uploaded_files': uploaded_files,
        'total_uploaded': len(uploaded_files),
        'errors': errors,
        'total_errors': len(errors)
    }

    if not uploaded_files and errors:
        return jsonify(response), 400
    elif errors:
        return jsonify(response), 207  # Multi-status
    else:
        return jsonify(response), 200   

@app.route('/find-person', methods=['POST'])
def find_person_in_photos():
    """Find person in group photos using reference image"""
    try:
        # Process reference image
        if 'file' not in request.files:
            return jsonify({'error': 'No reference image provided'}), 400
        
        reference_file = request.files['file']
        if not allowed_file(reference_file.filename):
            return jsonify({'error': 'Invalid file type'}), 400

        # Load and preprocess reference image
        reference_image = load_and_preprocess_image(reference_file)
        
        # Get face encoding
        face_encodings = face_recognition.face_encodings(reference_image)
        if len(face_encodings) != 1:
            return jsonify({'error': 'Reference image must contain exactly one face'}), 400
        reference_encoding = face_encodings[0]

        # Get tolerance from request
        try:
            tolerance = float(request.form.get('tolerance', DEFAULT_TOLERANCE))
        except ValueError:
            return jsonify({'error': 'Invalid tolerance value'}), 400

        # Get list of all images from Cloudinary
        result = cloudinary.api.resources(
            type="upload",
            prefix=GROUP_PHOTOS_FOLDER,
            max_results=500
        )
        
        image_files = []
        for resource in result.get('resources', []):
            public_id = resource['public_id']
            image_name = os.path.basename(public_id)
            if "." in image_name and image_name.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS:
                image_files.append((public_id, image_name))

        matching_images = []

        def check_image(image_data):
            public_id, image_name = image_data
            try:
                # Get cached encodings
                face_encodings = get_cached_encoding(image_name)
                if not face_encodings:
                    # If no cache, process the image
                    process_and_cache_image(public_id, image_name)
                    face_encodings = get_cached_encoding(image_name)
                
                for encoding in face_encodings:
                    matches = face_recognition.compare_faces(
                        [reference_encoding], 
                        encoding, 
                        tolerance=tolerance
                    )
                    if any(matches):
                        result = cloudinary.api.resource(public_id)
                        return {
                            'filename': image_name,
                            'url': result['secure_url']
                        }
            except Exception as e:
                print(f"Error processing {image_name}: {str(e)}")
            return None

        # Process in parallel
        with ThreadPoolExecutor() as executor:
            results = executor.map(check_image, image_files)
            for result in results:
                if result:
                    matching_images.append(result)

        return jsonify({
            'matches': matching_images,
            'tolerance_used': tolerance,
            'total_images_checked': len(image_files)
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/list-group-photos', methods=['GET'])
def list_group_photos():
    """List all uploaded group photos with metadata"""
    try:
        # Get list of all images from Cloudinary
        result = cloudinary.api.resources(
            type="upload",
            prefix=GROUP_PHOTOS_FOLDER,
            max_results=500
        )
        
        image_files = []
        for resource in result.get('resources', []):
            public_id = resource['public_id']
            filename = os.path.basename(public_id)
            if "." in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS:
                image_files.append({
                    'filename': filename,
                    'size': resource['bytes'],  # Size in bytes
                    'upload_time': resource['created_at'],  # Creation timestamp
                    'url': resource['secure_url'],
                    'view_url': resource['secure_url']  # Added to match your client
                })
        
        return jsonify({
            'photos': image_files,
            'count': len(image_files)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/view-image/<filename>', methods=['GET'])
def view_image(filename):
    """Redirect to Cloudinary image URL"""
    try:
        # Search for the image in Cloudinary
        result = cloudinary.api.resources(
            type="upload",
            prefix=GROUP_PHOTOS_FOLDER,
            max_results=500
        )
        
        for resource in result.get('resources', []):
            public_id = resource['public_id']
            resource_filename = os.path.basename(public_id)
            if resource_filename == filename:
                return redirect(resource['secure_url'])
        
        return jsonify({'error': 'Image not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/delete-group-photo/<filename>', methods=['DELETE'])
def delete_group_photo(filename):
    """Delete a group photo and its corresponding cache"""
    try:
        # Search for the image in Cloudinary
        image_found = False
        result = cloudinary.api.resources(
            type="upload",
            prefix=GROUP_PHOTOS_FOLDER,
            max_results=500
        )
        
        for resource in result.get('resources', []):
            public_id = resource['public_id']
            resource_filename = os.path.basename(public_id)
            if resource_filename == filename:
                # Delete the image
                cloudinary.uploader.destroy(public_id)
                image_found = True
                break
        
        if not image_found:
            return jsonify({'error': 'Image not found'}), 404
        
        # Delete the corresponding cache if it exists
        cache_public_id = f"{CACHE_FOLDER}/{filename}.pkl"
        try:
            cloudinary.uploader.destroy(cache_public_id, resource_type="raw")
        except:
            pass  # Cache might not exist
        
        return jsonify({
            'message': 'Group photo and cache deleted successfully',
            'filename': filename
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, threaded=True)