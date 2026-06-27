export type ImageResizeResult = {
  file: File;
  originalBytes: number;
  resizedBytes: number;
  width: number;
  height: number;
  resized: boolean;
};

export type ImageResizeOptions = {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
};

const DEFAULT_MAX_WIDTH = 1920;
const DEFAULT_MAX_HEIGHT = 1920;
const DEFAULT_QUALITY = 0.82;

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, index)).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Unable to load image for resizing'));
    };

    image.src = objectUrl;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Unable to resize image'));
          return;
        }
        resolve(blob);
      },
      type,
      quality
    );
  });
}

export async function resizeImageFile(
  file: File,
  options: ImageResizeOptions = {}
): Promise<ImageResizeResult> {
  if (!file.type.startsWith('image/') || file.type === 'image/gif') {
    return {
      file,
      originalBytes: file.size,
      resizedBytes: file.size,
      width: 0,
      height: 0,
      resized: false,
    };
  }

  const maxWidth = options.maxWidth ?? DEFAULT_MAX_WIDTH;
  const maxHeight = options.maxHeight ?? DEFAULT_MAX_HEIGHT;
  const quality = options.quality ?? DEFAULT_QUALITY;
  const image = await loadImage(file);

  const scale = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  if (scale === 1 && file.size <= 1024 * 1024) {
    return {
      file,
      originalBytes: file.size,
      resizedBytes: file.size,
      width: image.width,
      height: image.height,
      resized: false,
    };
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Unable to prepare image resizer');
  }

  context.drawImage(image, 0, 0, width, height);

  const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
  const blob = await canvasToBlob(canvas, outputType, quality);
  const extension = outputType === 'image/png' ? 'png' : 'jpg';
  const baseName = file.name.replace(/\.[^/.]+$/, '') || 'image';
  const resizedFile = new File([blob], `${baseName}-resized.${extension}`, {
    type: outputType,
    lastModified: Date.now(),
  });

  if (resizedFile.size >= file.size && scale === 1) {
    return {
      file,
      originalBytes: file.size,
      resizedBytes: file.size,
      width: image.width,
      height: image.height,
      resized: false,
    };
  }

  return {
    file: resizedFile,
    originalBytes: file.size,
    resizedBytes: resizedFile.size,
    width,
    height,
    resized: true,
  };
}
