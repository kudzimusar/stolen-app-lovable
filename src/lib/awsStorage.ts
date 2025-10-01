// AWS S3 Storage Service for Lost and Found Photos/Documents
// Uses server-side upload via Edge Function to avoid CORS issues

export interface UploadResult {
  url: string;
  key: string;
  bucket: string;
}

export class AWSStorageService {
  static async uploadFile(file: File, folder: string = 'lost-found'): Promise<UploadResult> {
    try {
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(7);
      const fileName = `${timestamp}-${randomId}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const key = `${folder}/${fileName}`;

      console.log('📤 Uploading to AWS S3 via Edge Function:', key);

      // Convert file to base64 for API transmission
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]); // Remove data:image/png;base64, prefix
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Call Edge Function to upload to S3
      const response = await fetch('/api/v1/upload-to-s3', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fileName: key,
          fileContent: base64,
          contentType: file.type,
          bucket: 'stolen-app'
        })
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      console.log('✅ File uploaded to S3:', result.url);

      return {
        url: result.url,
        key: key,
        bucket: 'stolen-app'
      };
    } catch (error) {
      console.error('AWS S3 upload error:', error);
      throw new Error(`Failed to upload to S3: ${error.message}`);
    }
  }

  static async uploadMultiple(files: File[], folder: string = 'lost-found'): Promise<UploadResult[]> {
    const uploadPromises = Array.from(files).map(file => this.uploadFile(file, folder));
    return Promise.all(uploadPromises);
  }

  static async deleteFile(key: string): Promise<boolean> {
    try {
      // Implement delete logic if needed
      return true;
    } catch (error) {
      console.error('Delete error:', error);
      return false;
    }
  }
}
