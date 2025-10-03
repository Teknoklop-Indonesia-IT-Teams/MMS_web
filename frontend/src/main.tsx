import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Import refresh protection test in development
if (process.env.NODE_ENV === "development") {
  import("./utils/refreshProtectionTest");
  import("./utils/logoutDebugTest");
}

// Register service worker with better error handling
if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("✅ SW registered: ", registration);
      })
      .catch((registrationError) => {
        console.warn("⚠️ SW registration failed: ", registrationError);
      });
  });
} else if (process.env.NODE_ENV === "development") {
  console.log("🔧 Service Worker disabled in development mode");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
