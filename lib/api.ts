/**
 * API service for FaceFind application
 * Handles all API calls to the backend
 */

const API_BASE_URL = 'http://localhost:5000';

interface UploadResponse {
  filename: string;
  url?: string;
  error?: string;
}

interface BulkUploadResponse {
  total_uploaded: number;
  uploaded_files: Array<{
    filename: string;
    url?: string;
  }>;
  errors?: Array<{
    filename: string;
    error: string;
  }>;
}

interface GroupPhoto {
  filename: string;
  size: number;
  url: string;
  view_url?: string;
  upload_time?: string;
}

interface ListPhotosResponse {
  count: number;
  photos: GroupPhoto[];
}

export interface FaceMatch {
  filename: string;
  url?: string;
  confidence: number;
  face_location: [number, number, number, number];
}

interface FindPersonResponse {
  tolerance_used: number;
  total_images_checked: number;
  matches: FaceMatch[];
}

/**
 * Upload a single group photo
 * @param file - The group photo file to upload
 */
export const uploadGroupPhoto = async (file: File): Promise<UploadResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/upload-group-photo`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading group photo:', error);
    throw error;
  }
};

/**
 * Upload multiple group photos
 * @param files - Array of group photo files to upload
 */
export const uploadBulkGroupPhotos = async (files: File[]): Promise<BulkUploadResponse> => {
  try {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await fetch(`${API_BASE_URL}/upload-bulk-group-photos`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok && response.status !== 207) {
      throw new Error(`Bulk upload failed with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading bulk group photos:', error);
    throw error;
  }
};

/**
 * Get list of all uploaded group photos
 */
export const listGroupPhotos = async (): Promise<ListPhotosResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/list-group-photos`);

    if (!response.ok) {
      throw new Error(`Failed to list photos with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error listing group photos:', error);
    throw error;
  }
};

/**
 * Find a person in group photos using a reference image
 * @param file - The reference image file
 * @param tolerance - Optional tolerance value for face matching (0-1)
 */
export const findPerson = async (file: File, tolerance: number = 0.5): Promise<FindPersonResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tolerance', tolerance.toString());

    const response = await fetch(`${API_BASE_URL}/find-person`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Find person failed with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error finding person:', error);
    throw error;
  }
};