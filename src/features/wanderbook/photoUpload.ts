import { uploadPhoto } from './services/wanderbookService';
import type { Uploaded } from './types';
import { t } from '@/lib/i18n';

/** Same as the backend's limit (goawaygo.media.max-photo-bytes). */
export const MAX_PHOTO_BYTES = 20_000_000;

export const PHOTO_ACCEPT = 'image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif';

function isHeic(file: File): boolean {
  return /image\/hei[cf]/i.test(file.type) || /\.hei[cf]$/i.test(file.name);
}

/**
 * Uploads a photo as the original file. iPhone HEIC photos are first turned into full-size JPEGs here (browsers
 * can't show HEIC); everything else is sent untouched. The backend removes location data and checks the photo.
 */
export async function uploadOriginal(file: File): Promise<Uploaded> {
  let upload: Blob = file;
  let name = file.name;
  if (isHeic(file)) {
    // Loaded only when needed: it is large.
    const { default: heic2any } = await import('heic2any');
    const converted = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.95 }).catch(
      () => {
        throw new Error(t("This HEIC photo couldn't be converted. Please share it as JPEG."));
      },
    );
    const jpeg = Array.isArray(converted) ? converted[0] : converted;
    if (!jpeg)
      throw new Error(t("This HEIC photo couldn't be converted. Please share it as JPEG."));
    upload = jpeg;
    name = name.replace(/\.hei[cf]$/i, '.jpg');
  }
  if (upload.size > MAX_PHOTO_BYTES) {
    throw new Error(t('Photos can be up to 20 MB.'));
  }
  return uploadPhoto(upload, name);
}
