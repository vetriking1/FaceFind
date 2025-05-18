
# Face Recognition API

A Flask-based API for finding faces in group photos using face recognition. The API uses Cloudinary for image storage and caching.

## Features

Upload single or multiple group photos

- Find a person across all uploaded photos

- List all group photos

- View and delete photos

- Automatic caching of face encodings for faster searches

## Requirements

- Python 3.7+

- Cloudinary account

- Face recognition libraries

## Installation

- Install the dependencies:

``` bash
pip install -r requirements.txt
```

- Set up your Cloudinary credentials:

``` python
cloudinary.config(
    cloud_name="....",
    api_key="....",
    api_secret="...."
)
```

## Running the API

Start the development server:

```bash
python app.py
```

The API will be available at <http://localhost:5000>

## API Endpoints

- POST /upload-group-photo - Upload a single group photo

- POST /upload-bulk-group-photos - Upload multiple group photos

- POST /find-person - Find a person in all group photos

- GET /list-group-photos - List all uploaded group photos

- GET /view-image/<filename> - View a specific image
