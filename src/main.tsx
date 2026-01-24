import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { shouldRegisterServiceWorker, logDesktopStatus } from "./lib/desktop-mode";

// Log desktop mode status for debugging
logDesktopStatus();

// Register Service Worker for PWA - ONLY in web mode (not desktop/file://)
if (shouldRegisterServiceWorker()) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('[PWA] Service Worker registered:', registration.scope);
        
        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content available, notify user
                console.log('[PWA] New content available, refresh to update');
              }
            });
          }
        });
      })
      .catch((error) => {
        console.log('[PWA] Service Worker registration failed:', error);
      });

    // Listen for sync messages from SW
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data.type === 'SYNC_READY') {
        console.log('[PWA] Sync ready, connectivity restored');
        window.dispatchEvent(new CustomEvent('sync-ready'));
      }
    });
  });
} else {
  console.log('[Desktop Mode] Service Worker registration skipped (file:// protocol)');
}

createRoot(document.getElementById("root")!).render(<App />);
