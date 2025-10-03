// Helper functions for handling HEIC files
import heic2any from "heic2any";

export const isHeicFile = (file: File): boolean => {
  const filename = file.name.toLowerCase();
  return filename.endsWith(".heic") || filename.endsWith(".heif");
};

export const convertHeicToJpeg = async (file: File): Promise<File> => {
  try {
    console.log("Converting HEIC file to JPEG...");
    const convertedBlob = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.8,
    });

    // heic2any can return Blob or Blob[], handle both cases
    const blob = Array.isArray(convertedBlob)
      ? convertedBlob[0]
      : convertedBlob;
    const convertedFile = new File(
      [blob],
      file.name.replace(/\.(heic|heif)$/i, ".jpg"),
      {
        type: "image/jpeg",
      }
    );

    console.log("HEIC conversion successful");
    return convertedFile;
  } catch (error) {
    console.error("HEIC conversion failed:", error);
    throw error;
  }
};

export const getHeicPlaceholder = (): string => {
  return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjUwIiB5PSI0NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjNjc3NDhGIj5IRUlDPC90ZXh0Pgo8dGV4dCB4PSI1MCIgeT0iNjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCIgZmlsbD0iIzY3NzQ4RiI+UHJldmlldyBOL0E8L3RleHQ+Cjwvc3ZnPgo=";
};

export const createFilePreview = async (file: File): Promise<string> => {
  if (isHeicFile(file)) {
    // Untuk HEIC, convert ke JPEG untuk preview (tapi file asli tetap HEIC)
    try {
      console.log("Converting HEIC to preview...");
      const convertedBlob = await heic2any({
        blob: file,
        toType: "image/jpeg",
        quality: 0.8,
      });

      const blob = Array.isArray(convertedBlob)
        ? convertedBlob[0]
        : convertedBlob;

      // Create preview URL from converted blob
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          console.log("HEIC preview created successfully");
          resolve(result);
        };
        reader.onerror = () => {
          console.error("Error creating HEIC preview");
          resolve(getHeicPlaceholder());
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Failed to convert HEIC for preview:", error);
      return getHeicPlaceholder();
    }
  } else {
    // Standard image file - create normal preview
    console.log("Processing standard image file...");
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        console.log("Standard image preview created");
        resolve(result);
      };
      reader.onerror = (error) => {
        console.error("FileReader error for standard image:", error);
        // Return error placeholder instead of rejecting
        resolve(
          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRkVGMkY0IiBzdHJva2U9IiNGQ0E1QTUiIHN0cm9rZS13aWR0aD0iMiIvPgo8dGV4dCB4PSI0MCIgeT0iNDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCIgZmlsbD0iI0Y1OUUwQiI+UHJldmlldyBFcnJvcjwvdGV4dD4KPHRleHQgeD0iNDAiIHk9IjU1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iOCIgZmlsbD0iIzczNzM3NCI+RmlsZSBVcGxvYWRlZDwvdGV4dD4KPC9zdmc+Cg=="
        );
      };
      reader.readAsDataURL(file);
    });
  }
};
