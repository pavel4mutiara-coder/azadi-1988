/**
 * Mock Storage Service
 * Simulates storage bucket objects and image URLs repair mechanics
 */

class MockStorage {
  public app = {
    options: {
      storageBucket: 'mock-storage-bucket.appspot.com',
      projectId: 'azadi-mock'
    }
  };
}

export const storageInstance = new MockStorage();

/**
 * Repairs direct Firebase Storage URLs if they pointing to older/stale projects.
 * In a mock offline-first setup, handles standard data URIs and public images elegantly.
 */
export const repairImageUrl = (url: any): string => {
  if (!url || typeof url !== 'string') return "";
  if (url.includes("placeholder") || url.startsWith("data:") || url.startsWith("blob:")) return url;
  return url;
};

/**
 * Simulates deleting storage objects (assets).
 */
export const deleteStorageObject = async (url: string): Promise<{ success: boolean; error?: string }> => {
  console.log("[Mock Storage] Requesting deletion of asset:", url);
  return { success: true };
};
