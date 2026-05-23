/**
 * Decoupled Upload Service
 * Emulates the multipart/resumable upload cycle by processing, compressing
 * other selected forms, and converting them to stable client-side persistent Base64 URIs.
 * Completely decoupled from Firebase Storage.
 */

import { crashlyticsService } from './crashlyticsService';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase';

export interface UploadLog {
  id: string;
  timestamp: number;
  type: 'info' | 'warn' | 'error' | 'success';
  message: string;
  details?: any;
}

export const SUPPORTED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit

class UploadService {
  private logs: UploadLog[] = [];
  private listeners: ((logs: UploadLog[]) => void)[] = [];

  getBucketMode(): 'appspot' | 'firebasestorage' | 'default' {
    const saved = localStorage.getItem('upload_bucket_mode');
    return (saved as any) || 'default';
  }

  setBucketMode(mode: 'appspot' | 'firebasestorage' | 'default') {
    localStorage.setItem('upload_bucket_mode', mode);
    this.addLog('info', `Config: Storage Bucket mode set to '${mode}' (Simulated)`);
  }

  getForceDirect(): boolean {
    const saved = localStorage.getItem('upload_force_direct');
    return saved !== 'false'; 
  }

  setForceDirect(val: boolean) {
    localStorage.setItem('upload_force_direct', val ? 'true' : 'false');
    this.addLog('info', `Config: Force Direct Upload mode set to ${val} (Simulated)`);
  }

  getBypassCompression(): boolean {
    const saved = localStorage.getItem('upload_bypass_compression');
    return saved === 'true';
  }

  setBypassCompression(val: boolean) {
    localStorage.setItem('upload_bypass_compression', val ? 'true' : 'false');
    this.addLog('info', `Config: Bypass Compression set to ${val}`);
  }

  getUseFallbackBase64(): 'auto' | 'always' | 'never' {
    const saved = localStorage.getItem('upload_use_fallback_base64');
    return (saved as any) || 'auto';
  }

  setUseFallbackBase64(mode: 'auto' | 'always' | 'never') {
    localStorage.setItem('upload_use_fallback_base64', mode);
    this.addLog('info', `Config: Base64 Fallback Mode set to '${mode}'`);
  }

  public addLog(type: UploadLog['type'], message: string, details?: any) {
    const log: UploadLog = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      type,
      message,
      details
    };
    this.logs.unshift(log);
    if (this.logs.length > 100) this.logs.pop();
    
    console.log(`[UploadService ${type.toUpperCase()}] ${message}`, details || '');
    this.notifyStatus();

    // Telemetry tracking
    if (type === 'error') {
      const detailsMsg = details ? ` | details: ${JSON.stringify(details).substring(0, 200)}` : '';
      crashlyticsService.recordException(new Error(`${message}${detailsMsg}`), 'UploadService_Failure');
    } else if (type === 'warn') {
      crashlyticsService.log(`[WARN] ${message} ${details ? JSON.stringify(details).substring(0, 150) : ''}`);
    } else {
      crashlyticsService.log(`${message}`);
    }
  }

  private notifyStatus() {
    this.listeners.forEach(l => l([...this.logs]));
  }

  subscribe(callback: (logs: UploadLog[]) => void) {
    this.listeners.push(callback);
    callback([...this.logs]);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  getLogs() {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
    this.notifyStatus();
  }

  getStorageInstance() {
    this.addLog('info', 'Returning mock Local Storage tracking instance.');
    return {};
  }

  async validateFile(file: File) {
    this.addLog('info', 'Validating selected upload file', { 
      name: file.name, 
      size: `${(file.size / 1024).toFixed(1)}KB`, 
      type: file.type 
    });
    
    if (file.size === 0) {
      const msg = "Upload rejected: File is empty (0 bytes).";
      this.addLog('error', msg);
      throw new Error(msg);
    }

    const lowerType = file.type.toLowerCase();
    const isImage = SUPPORTED_FORMATS.some(fmt => lowerType === fmt) || file.name.slice(-4).toLowerCase().match(/\.(jpg|png|webp|jpeg)/i);
    
    if (!isImage) {
      const msg = `Upload rejected: Unsupported format. Allowed: JPG, PNG, WEBP.`;
      this.addLog('error', msg);
      throw new Error(msg);
    }

    return true;
  }

  async compressImage(file: File, maxWidth = 1000, quality = 0.75): Promise<Blob> {
    this.addLog('info', 'Executing Image Compression Engine...', { maxWidth, quality, originalSize: `${(file.size / 1024).toFixed(1)}KB` });
    
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            this.addLog('warn', 'Canvas unavailable. Bypassing compression.');
            return resolve(file);
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'medium';
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (blob && blob.size > 0) {
              this.addLog('info', 'Compression complete.', { 
                original: `${(file.size / 1024).toFixed(1)}KB`, 
                compressed: `${(blob.size / 1024).toFixed(1)}KB`,
                ratio: `${((blob.size / file.size) * 100).toFixed(0)}%`
              });
              resolve(blob);
            } else {
              this.addLog('warn', 'Compression returned bad blob. Passing raw file.');
              resolve(file);
            }
          }, 'image/jpeg', quality);
        };
        img.onerror = () => {
          resolve(file);
        };
      };
      reader.onerror = () => {
        resolve(file);
      };
    });
  }

  private blobToDataURL(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error("FileReader result is not a string"));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  }

  async upload(
    file: File, 
    folder: string = 'uploads', 
    onProgress?: (progress: number) => void
  ): Promise<string> {
    this.addLog('info', `UPLOAD_EXEC: Starting Firebase Storage upload pipeline in '/${folder}'...`, { filename: file.name });

    try {
      await this.validateFile(file);
      
      const compressedBlob = this.getBypassCompression()
        ? file
        : await this.compressImage(file);
      
      if (compressedBlob.size > MAX_FILE_SIZE) {
        throw new Error(`Compressed file size exceeds the max threshold: ${(compressedBlob.size / 1024 / 1024).toFixed(1)}MB > 5MB`);
      }

      this.addLog('info', 'Uploading to Firebase Storage...');
      
      const uniqueName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const fileRef = ref(storage, `${folder}/${uniqueName}`);
      const uploadTask = uploadBytesResumable(fileRef, compressedBlob);

      return new Promise<string>((resolve, reject) => {
        uploadTask.on('state_changed', 
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (onProgress) onProgress(progress);
          }, 
          (error) => {
            this.addLog('error', 'Firebase Storage upload failed', error);
            reject(error);
          }, 
          async () => {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            this.addLog('success', 'Firebase Storage upload success!', { downloadUrl });
            resolve(downloadUrl);
          }
        );
      });
    } catch (error: any) {
      this.addLog('error', 'Upload process aborted', { message: error.message });
      throw error;
    }
  }

  async delete(url: string) {
    if (!url || !url.startsWith('http') || !url.includes('firebasestorage')) return;
    this.addLog('info', 'Executing Firebase Storage asset deletion...', { url: url.substring(0, 40) + '...' });
    try {
      const fileRef = ref(storage, url);
      await deleteObject(fileRef);
      this.addLog('success', 'Asset successfully deleted from Firebase Storage.');
    } catch (err: any) {
      this.addLog('error', 'Asset deletion failed', err);
    }
  }
}

export const uploadService = new UploadService();
export type { UploadService };
