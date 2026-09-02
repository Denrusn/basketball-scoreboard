/**
 * Checks if the application is running inside a Capacitor native container (Android or iOS)
 */
export const isCapacitorNative = (): boolean => {
  return typeof (window as any).Capacitor !== 'undefined' && typeof (window as any).Capacitor.isNativePlatform === 'function'
    ? (window as any).Capacitor.isNativePlatform()
    : false;
};

/**
 * Initializes mobile full-screen immersive mode.
 *
 * Note: The immersive fullscreen & landscape lock are implemented natively:
 *  - Android: MainActivity.java (WindowInsetsControllerCompat hides system bars,
 *    FLAG_KEEP_SCREEN_ON, landscape orientation)
 *  - iOS: Info.plist (UIStatusBarHidden, UIViewControllerBasedStatusBarAppearance=false,
 *    landscape-only supported orientations)
 *
 * Here we only need to force a relayout so the web content fills the new viewport.
 */
export const initMobileImmersiveMode = async (): Promise<void> => {
  if (!isCapacitorNative()) return;

  // Some Android devices restore system bars after first paint; the native
  // MainActivity re-hides them on onWindowFocusChanged. Just nudge layout.
  await new Promise((resolve) => setTimeout(resolve, 50));
  window.dispatchEvent(new Event('resize'));
};

/**
 * Toggle full screen in both native Capacitor app and browser
 */
export const requestAppFullScreen = async (): Promise<boolean> => {
  // In the native container the app is already fullscreen & immersive (native layer).
  if (isCapacitorNative()) {
    return true;
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
