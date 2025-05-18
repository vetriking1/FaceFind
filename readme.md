# FaceFind

A modern web application that leverages facial recognition technology to find people in group photos. Upload group photos, search for specific faces, and manage your gallery with ease.

## Features

- **Upload Photos:** Upload individual or multiple group photos for facial recognition processing.
- **Browse Gallery:** View and manage all your uploaded group photos in one place.
- **Find People:** Upload a reference image to find matching faces across all your group photos.
- **Advanced Face Recognition:** Accurate face detection even in challenging lighting conditions.
- **Fast Processing:** Quickly process large batches of photos without sacrificing accuracy.

## Tech Stack

- **Frontend:** Next.js, React, Tailwind CSS, Radix UI, Framer Motion
- **Backend:** Flask (Python), face-recognition, Cloudinary for image storage and caching

## Setup

### Prerequisites

- Node.js (v14 or later)
- Python 3.7+
- Cloudinary account

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install the required Python packages:
   ```bash
   pip install -r requirement.txt
   ```

3. Configure your Cloudinary credentials in `cloudAPI.py`:
   ```python
   cloudinary.config(
       cloud_name="your_cloud_name",
       api_key="your_api_key",
       api_secret="your_api_secret"
   )
   ```

4. Start the Flask development server:
   ```bash
   python cloudAPI.py
   ```
   The API will be available at http://localhost:5000.

### Frontend Setup

1. In the project root, install the Node.js dependencies:
   ```bash
   npm install
   ```

2. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   The application will be available at http://localhost:3000.

## Usage

- **Upload Photos:** Navigate to the upload page to add group photos.
- **Browse Gallery:** Visit the gallery page to view and manage your uploaded photos.
- **Find People:** Use the search page to upload a reference image and find matching faces across your photos.

## API Endpoints

- **POST /upload-group-photo:** Upload a single group photo.
- **POST /upload-bulk-group-photos:** Upload multiple group photos.
- **POST /find-person:** Find a person in all group photos.
- **GET /list-group-photos:** List all uploaded group photos.
- **GET /view-image/<filename>:** View a specific image.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

