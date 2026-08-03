export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
  "image/svg+xml",
];

export const MAX_IMAGE_SIZE_MB = 5;

export interface OptimizeImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: "image/webp" | "image/jpeg";
}

export const DEFAULT_OPTIMIZE_OPTIONS: Required<OptimizeImageOptions> = {
  maxWidth: 1600,
  maxHeight: 1600,
  quality: 0.82,
  mimeType: "image/webp",
};

const RESIZABLE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export const formatFileSize = (bytes: number) => {
  if (!bytes) return "0 KB";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const validateImageFile = (
  file: File,
  maxSizeMb = MAX_IMAGE_SIZE_MB,
  acceptedTypes: string[] = ACCEPTED_IMAGE_TYPES
): string | null => {
  if (!file.type.startsWith("image/")) return "Only image files can be uploaded";
  if (!acceptedTypes.includes(file.type)) {
    const readable = acceptedTypes
      .map((type) => type.replace("image/", "").toUpperCase())
      .join(", ");
    return `Unsupported format. Use ${readable}`;
  }
  if (file.size > maxSizeMb * 1024 * 1024) {
    return `Image must be smaller than ${maxSizeMb} MB`;
  }
  return null;
};

const loadBitmap = async (file: File): Promise<ImageBitmap | HTMLImageElement> => {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file);
    } catch {}
  }
  const objectUrl = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Could not read the image"));
      img.src = objectUrl;
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

const renameForType = (fileName: string, mimeType: string) => {
  const extension = mimeType === "image/webp" ? "webp" : "jpg";
  const base = fileName.replace(/\.[^.]+$/, "") || "image";
  return `${base}.${extension}`;
};

export const optimizeImage = async (
  file: File,
  options: OptimizeImageOptions = {}
): Promise<File> => {
  const { maxWidth, maxHeight, quality, mimeType } = { ...DEFAULT_OPTIMIZE_OPTIONS, ...options };

  if (!RESIZABLE_TYPES.includes(file.type)) return file;

  let source: ImageBitmap | HTMLImageElement;
  try {
    source = await loadBitmap(file);
  } catch {
    return file;
  }

  const { width, height } = source;
  if (!width || !height) return file;

  const scale = Math.min(1, maxWidth / width, maxHeight / height);
  const targetWidth = Math.max(1, Math.round(width * scale));
  const targetHeight = Math.max(1, Math.round(height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const context = canvas.getContext("2d");
  if (!context) return file;

  context.drawImage(source, 0, 0, targetWidth, targetHeight);
  if ("close" in source) source.close();

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, mimeType, quality);
  });

  if (!blob || blob.size >= file.size) return file;

  return new File([blob], renameForType(file.name, blob.type), {
    type: blob.type,
    lastModified: Date.now(),
  });
};
