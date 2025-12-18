/**
 * SendellBank - Main Entry Point
 *
 * This is the main entry point for the SendellBank application.
 * It imports the root component and initializes the application.
 */

// Import the root application component
import './app-root';

// Service Worker Registration for PWA
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });
      console.log('ServiceWorker registration successful:', registration.scope);
    } catch (error) {
      console.log('ServiceWorker registration failed:', error);
    }
  });
}

// Handle app install prompt
let deferredPrompt: BeforeInstallPromptEvent | null = null;

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

window.addEventListener('beforeinstallprompt', (e: Event) => {
  e.preventDefault();
  deferredPrompt = e as BeforeInstallPromptEvent;

  // Dispatch custom event for UI to show install button
  window.dispatchEvent(new CustomEvent('app-installable', { detail: true }));
});

// Export for potential use in components
export const getInstallPrompt = () => deferredPrompt;

export const promptInstall = async (): Promise<boolean> => {
  if (!deferredPrompt) return false;

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;

  return outcome === 'accepted';
};

// Log app version in development
if (import.meta.env.DEV) {
  console.log(
    '%c🏦 SendellBank',
    'font-size: 24px; font-weight: bold; color: #0066cc;'
  );
  console.log(
    '%cBienvenido al entorno de desarrollo',
    'font-size: 12px; color: #666;'
  );
}
