// utils/imageDebug.ts
export const debugImageLoad = async (
  src: string
): Promise<{
  success: boolean;
  url: string;
  error?: string;
}> => {
  return new Promise((resolve) => {
    const img = new Image();

    img.onload = () => {
      console.log(`✅ Debug: Image loaded successfully: ${src}`);
      resolve({ success: true, url: src });
    };

    img.onerror = (e) => {
      console.error(`❌ Debug: Image failed to load: ${src}`);
      console.error("Error event:", e);
      resolve({
        success: false,
        url: src,
        error: "Failed to load image",
      });
    };

    // Set timeout
    setTimeout(() => {
      if (!img.complete) {
        console.error(`⏰ Debug: Image load timeout: ${src}`);
        resolve({
          success: false,
          url: src,
          error: "Load timeout",
        });
      }
    }, 5000);

    img.src = src;
  });
};

export const testImageUrls = async (filename: string) => {
  const baseUrl = import.meta.env.VITE_URL || window.location.origin;
  const testUrls = [
    `${baseUrl}/uploads/${filename}`,
    `${baseUrl}/uploads/${filename}?t=${Date.now()}`,
    `http://localhost:3001/uploads/${filename}`,
    `http://localhost:3001/uploads/${filename}?test=123`,
    filename, // Original
    `/uploads/${filename}`, // With leading slash
  ];

  console.log(`🧪 Testing image URLs for: ${filename}`);

  for (const url of testUrls) {
    console.log(`Testing: ${url}`);
    const result = await debugImageLoad(url);
    console.log(
      `Result: ${result.success ? "✅" : "❌"} ${result.error || ""}`
    );

    if (result.success) {
      return url; // Return first working URL
    }
  }

  return null; // No URL worked
};
