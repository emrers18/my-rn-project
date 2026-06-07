import { supabase } from './supabase';

/**
 * Uploads a local image file to the Supabase Storage 'avatars' bucket for a specific user.
 * Cleans up any old avatars in the user's folder before uploading the new one.
 *
 * @param userId The unique ID of the user.
 * @param localUri The local file URI (e.g. from expo-image-picker).
 * @returns The public URL of the uploaded avatar.
 */
/**
 * Decodes a base64 string (optionally containing a data URI prefix) into an ArrayBuffer.
 * This is used to bypass React Native's fetch/Blob binary upload limitations.
 */
export function decodeBase64ToArrayBuffer(base64: string): ArrayBuffer {
  const cleanedBase64 = base64.includes(',') ? base64.split(',')[1] : base64;

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const lookup = new Uint8Array(256);
  for (let i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i;
  }

  // Remove padding characters and whitespace
  const str = cleanedBase64.replace(/=+$/, '').replace(/[\s\r\n]+/g, '');
  const len = str.length;
  const bufferLength = Math.floor(len * 0.75);
  const arrayBuffer = new ArrayBuffer(bufferLength);
  const bytes = new Uint8Array(arrayBuffer);

  let p = 0;
  for (let i = 0; i < len; i += 4) {
    const encoded1 = lookup[str.charCodeAt(i)];
    const encoded2 = lookup[str.charCodeAt(i + 1)];
    const encoded3 = i + 2 < len ? lookup[str.charCodeAt(i + 2)] : 0;
    const encoded4 = i + 3 < len ? lookup[str.charCodeAt(i + 3)] : 0;

    bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
    if (p < bufferLength) {
      bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
    }
    if (p < bufferLength) {
      bytes[p++] = ((encoded3 & 3) << 6) | encoded4;
    }
  }

  return arrayBuffer;
}

/**
 * Uploads a local image file to the Supabase Storage 'avatars' bucket for a specific user.
 * Cleans up any old avatars in the user's folder before uploading the new one.
 *
 * @param userId The unique ID of the user.
 * @param localUri The local file URI (e.g. from expo-image-picker).
 * @returns The public URL of the uploaded avatar.
 */
export async function uploadAvatar(userId: string, localUri: string): Promise<string> {
  const response = await fetch(localUri);
  const blob = await response.blob();

  // Convert blob to base64 using FileReader
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = (e) => {
      reject(new Error(`Failed to read file blob: ${e}`));
    };
    reader.readAsDataURL(blob);
  });

  const arrayBuffer = decodeBase64ToArrayBuffer(base64);

  const fileExt = localUri.split('.').pop()?.toLowerCase() || 'jpg';
  const cleanExt = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt) ? fileExt : 'jpg';
  const fileName = `avatar_${Date.now()}.${cleanExt}`;
  const filePath = `${userId}/${fileName}`;

  // 1. Ensure the avatars bucket exists (fails silently if it already exists or if we lack creation rights)
  try {
    await supabase.storage.createBucket('avatars', {
      public: true,
      fileSizeLimit: 2 * 1024 * 1024, // 2MB limit
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    });
  } catch {
    // Fails silently if bucket is already created
  }

  // 2. Clean up existing avatar files in the user's folder to save storage space
  try {
    const { data: existingFiles } = await supabase.storage.from('avatars').list(userId);
    if (existingFiles && existingFiles.length > 0) {
      const filesToDelete = existingFiles.map((file) => `${userId}/${file.name}`);
      await supabase.storage.from('avatars').remove(filesToDelete);
    }
  } catch (error) {
    console.warn('Failed to clean up old avatar files:', error);
  }

  // 3. Upload the new avatar file
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, arrayBuffer, {
      contentType: `image/${cleanExt === 'jpg' ? 'jpeg' : cleanExt}`,
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Avatar upload failed: ${uploadError.message}`);
  }

  // 4. Retrieve and return the public URL
  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

  if (!data?.publicUrl) {
    throw new Error('Failed to retrieve the public URL for the uploaded avatar.');
  }

  return data.publicUrl;
}
