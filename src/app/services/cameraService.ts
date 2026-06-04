import { Camera, CameraResultType, CameraSource, type Photo } from '@capacitor/camera';

export const cameraService = {
  async takePhoto(): Promise<string | null> {
    try {
      const image: Photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });
      return image.dataUrl || null;
    } catch {
      return null;
    }
  },

  async pickFromGallery(): Promise<string | null> {
    try {
      const image: Photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
      });
      return image.dataUrl || null;
    } catch {
      return null;
    }
  },
};
