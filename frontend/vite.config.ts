import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react(), // Use simple react plugin without babel config
  ],
  base: "/",
  build: {
    target: "es2020",
    minify: "terser",
    chunkSizeWarningLimit: 150, // Stricter warning limit
    cssCodeSplit: true,
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
        dead_code: true,
        unused: true,
      },
      mangle: {
        toplevel: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom"],
          "vendor-router": ["react-router-dom"],

          "vendor-ui": ["lucide-react", "react-hot-toast"],
          "vendor-table": ["@tanstack/react-table"],

          "vendor-http": ["axios"],
          "vendor-media": ["qrcode", "html2canvas"],

          "vendor-utils": [],

          "equipment-table": ["src/components/Equipment/EquipmentTable.tsx"],
          "equipment-form": ["src/components/Equipment/EquipmentForm.tsx"],
          dashboard: ["src/components/DashboardTelemetry/Dashboard.tsx"],
        },
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId
                .split("/")
                .pop()
                ?.replace(".tsx", "")
                .replace(".ts", "") || "chunk"
            : "chunk";
          return `js/${facadeModuleId}-[hash].js`;
        },
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) return "assets/[name]-[hash][extname]";
          const extType = assetInfo.name.split(".").at(1) || "";
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            return `img/[name]-[hash][extname]`;
          }
          if (/css/i.test(extType)) {
            return `css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
      },
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        // target: "https://api-mms.teknoklop.com",
        changeOrigin: true,
      },
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom", "axios"],
    exclude: ["@tanstack/react-table"],
  },
});
