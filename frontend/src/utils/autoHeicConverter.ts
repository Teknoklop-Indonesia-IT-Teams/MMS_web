import heic2any from "heic2any";

export interface ConversionResult {
  convertedFile: File | null;
  originalFile: File;
  isConverted: boolean;
  previewUrl: string;
  error?: string;
}

export async function autoConvertHeic(file: File): Promise<ConversionResult> {
  const result: ConversionResult = {
    convertedFile: null,
    originalFile: file,
    isConverted: false,
    previewUrl: "",
    error: undefined,
  };

  try {
    const isHeicFile = /\.(heic|heif)$/i.test(file.name);

    if (!isHeicFile) {
      result.previewUrl = URL.createObjectURL(file);
      return result;
    }
    const convertedBlob = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.8,
    });

    const blob = Array.isArray(convertedBlob)
      ? convertedBlob[0]
      : convertedBlob;

    const jpegFileName = file.name.replace(/\.(heic|heif)$/i, ".jpg");
    const convertedFile = new File([blob], jpegFileName, {
      type: "image/jpeg",
      lastModified: file.lastModified,
    });

    result.convertedFile = convertedFile;
    result.isConverted = true;
    result.previewUrl = URL.createObjectURL(blob);

    return result;
  } catch (error) {
    console.error("❌ HEIC auto-conversion failed:", error);
    result.error = error instanceof Error ? error.message : "Conversion failed";

    try {
      result.previewUrl = URL.createObjectURL(file);
    } catch (previewError) {
      console.error("❌ Failed to create preview:", previewError);
    }

    return result;
  }
}

export function getUploadFile(conversionResult: ConversionResult): File {
  return conversionResult.convertedFile || conversionResult.originalFile;
}

export function isHeicFile(file: File): boolean {
  return /\.(heic|heif)$/i.test(file.name);
}

export function cleanupPreviewUrl(url: string): void {
  if (url && url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}
