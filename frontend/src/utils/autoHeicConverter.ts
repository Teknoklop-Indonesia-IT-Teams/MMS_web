// Auto HEIC converter utility
import heic2any from "heic2any";

export interface ConversionResult {
  convertedFile: File | null;
  originalFile: File;
  isConverted: boolean;
  previewUrl: string;
  error?: string;
}

/**
 * Auto-detect and convert HEIC files to JPEG
 */
export async function autoConvertHeic(file: File): Promise<ConversionResult> {
  const result: ConversionResult = {
    convertedFile: null,
    originalFile: file,
    isConverted: false,
    previewUrl: "",
    error: undefined,
  };

  try {
    // Check if file is HEIC/HEIF
    const isHeicFile = /\.(heic|heif)$/i.test(file.name);

    if (!isHeicFile) {
      // Not a HEIC file, use as-is
      result.previewUrl = URL.createObjectURL(file);
      return result;
    }
    // Convert HEIC to JPEG
    const convertedBlob = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.8,
    });

    // Handle both single blob and array of blobs
    const blob = Array.isArray(convertedBlob)
      ? convertedBlob[0]
      : convertedBlob;

    // Create new File from converted blob
    const jpegFileName = file.name.replace(/\.(heic|heif)$/i, ".jpg");
    const convertedFile = new File([blob], jpegFileName, {
      type: "image/jpeg",
      lastModified: file.lastModified,
    });

    // Create preview URL
    result.convertedFile = convertedFile;
    result.isConverted = true;
    result.previewUrl = URL.createObjectURL(blob);

    return result;
  } catch (error) {
    console.error("❌ HEIC auto-conversion failed:", error);
    result.error = error instanceof Error ? error.message : "Conversion failed";

    // Fallback to original file
    try {
      result.previewUrl = URL.createObjectURL(file);
    } catch (previewError) {
      console.error("❌ Failed to create preview:", previewError);
    }

    return result;
  }
}

/**
 * Get the file to upload (converted if HEIC, original otherwise)
 */
export function getUploadFile(conversionResult: ConversionResult): File {
  return conversionResult.convertedFile || conversionResult.originalFile;
}

/**
 * Check if a file is HEIC format
 */
export function isHeicFile(file: File): boolean {
  return /\.(heic|heif)$/i.test(file.name);
}

/**
 * Cleanup preview URLs to prevent memory leaks
 */
export function cleanupPreviewUrl(url: string): void {
  if (url && url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}
