import fs from 'fs/promises';
import path from 'path';

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  // Store locally in client/public/uploads so the frontend can serve it instantly
  const uploadDir = path.join(process.cwd(), 'client', 'public', 'uploads');
  const filePath = path.join(uploadDir, relKey);
  
  // Ensure the directory exists
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  
  // Write the file
  await fs.writeFile(filePath, data);
  
  // Return the public URL path
  const url = `/uploads/${relKey}`;
  return { key: relKey, url };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string; }> {
  return {
    key: relKey,
    url: `/uploads/${relKey}`,
  };
}
