import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';
import { compressInputImage } from './imageOptimizer';

export interface UploadImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  fileName?: string;
  onProgress?: (progress: number) => void;
  maxRetries?: number;
}

/**
 * Clean, production-grade image upload utility that handles:
 * 1. Image validation & client-side compression
 * 2. Firebase Storage upload using uploadBytesResumable with progress callbacks
 * 3. Fetching and returning the immutable download URL
 * 4. Direct error propagation for user feedback
 */
export async function uploadImage(
  fileOrBlob: File | Blob,
  folder: string,
  options: UploadImageOptions = {}
): Promise<string> {
  const {
    maxWidth = 1024,
    maxHeight = 1024,
    quality = 0.8,
    fileName,
    onProgress,
    maxRetries = 2
  } = options;

  if (!fileOrBlob) {
    throw new Error('No file provided for upload.');
  }

  // 1. Client-side image compression
  let blobToUpload: Blob;
  try {
    blobToUpload = await compressInputImage(fileOrBlob, maxWidth, maxHeight, quality);
  } catch (compressErr) {
    console.warn('[uploadImage] Client-side image compression bypassed:', compressErr);
    blobToUpload = fileOrBlob;
  }

  // 2. Prepare Storage path & metadata for configured Firebase Storage
  const originalName = fileName || (fileOrBlob as File).name || 'image.jpg';
  const cleanName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const fileId = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}_${cleanName}`;
  const normalizedFolder = folder.replace(/^\/+|\/+$/g, '');
  const storagePath = `${normalizedFolder}/${fileId}`;

  const contentType = blobToUpload.type || (fileOrBlob as File).type || 'image/jpeg';
  const metadata = { contentType };

  let attempt = 0;
  const storageRef = ref(storage, storagePath);

  while (attempt <= maxRetries) {
    try {
      const downloadUrl = await new Promise<string>((resolve, reject) => {
        const uploadTask = uploadBytesResumable(storageRef, blobToUpload, metadata);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            if (snapshot.totalBytes > 0) {
              const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
              if (onProgress) {
                onProgress(progress);
              }
            }
          },
          (error) => {
            reject(error);
          },
          async () => {
            try {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(url);
            } catch (urlErr) {
              reject(urlErr);
            }
          }
        );
      });

      return downloadUrl;
    } catch (err: any) {
      attempt++;
      if (attempt <= maxRetries) {
        console.warn(`[uploadImage] Upload attempt ${attempt} failed, retrying...`, err);
        await new Promise((r) => setTimeout(r, 1000 * attempt));
      } else {
        throw err;
      }
    }
  }

  throw new Error('Upload failed.');
}

