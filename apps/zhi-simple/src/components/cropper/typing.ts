import type Cropper from 'cropperjs';

export interface CropendResult {
  imgBase64: string;
  imgInfo: Cropper.Data;
}

export type UploadApi = (data: { file: File; path: string }) => Promise<string>;

export type { Cropper };
