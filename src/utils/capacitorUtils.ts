import { StatusBar, Style } from '@capacitor/status-bar';
import { ScreenOrientation } from '@capacitor/screen-orientation';

/**
 * Checks if the application is running inside a Capacitor native container (Android or iOS)
 */
export const isCapacitorNative = (): boolean => {
  return typeof (window as any).Capacitor !== 'undefined' && typeof (window as any).Capacitor.isNativePlatform === 'function'
    ? (window as any).Capacitor.isNativePlatform()
    : false;
};

/**
 * Initializes mobile full-screen immersive mode and status bar handling
 */
export const initMobileImmersiveMode = async (): Promise<void> => {
  if (!isCapacitorNative()) return;

  try {
    // 1. Hide the Android/iOS status bar for true full screen
    await StatusBar.hide();
  } catch (err) {
    try {
      // Fallback: set transparent dark status bar overlay
      await StatusBar.setOverlaysWebView({ overlay: true });
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#00000000' });
    } catch {
      // Ignore if not supported on the specific device
    }
  }

  // 2. Lock to landscape on mobile if preferred, or allow full rotation
  try {
    // We keep orientation fluid or auto-landscape on tablets
    // ScreenOrientation.lock({ orientation: 'landscape' });
  } catch {
    // Ignore
  }
};

/**
 * Toggle full screen in both native Capacitor app and browser
 */
export const requestAppFullScreen = async (): Promise<boolean> => {
  if (isCapacitorNative()) {
    try {
      await StatusBar.hide();
      try {
        await ScreenOrientation.lock({ orientation: 'landscape' });
      } catch {
        // Ignore rotation lock error
      }
      return true;
    } catch (err) {
      console.warn('Native fullscreen request error:', err);
    }
  }

  // Browser Fullscreen API
  try {
    const rootEl = document.documentElement;
    if (rootEl.requestFullscreen) {
      await rootEl.requestFullscreen();
    } else if ((rootEl as any).webkitRequestFullscreen) {
      await (rootEl as any).webkitRequestFullscreen();
    }
    return true;
  } catch (err) {
    console.warn('Browser fullscreen request failed:', err);
    return false;
  }
};

/**
 * Exit full screen in both native app and browser
 */
export const exitAppFullScreen = async (): Promise<void> => {
  if (isCapacitorNative()) {
    try {
      await ScreenOrientation.unlock();
    } catch {
      // Ignore
    }
  }

  if (document.fullscreenElement || (document as any).webkitFullscreenElement) {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      }
    } catch {
      // Ignore
    }
  }
};
