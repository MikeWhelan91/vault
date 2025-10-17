import { Capacitor } from '@capacitor/core';
import { useState, useEffect } from 'react';

/**
 * Platform detection utilities for Forebearer app
 */

export const platform = {
  /**
   * Check if the app is running in a native mobile context (iOS or Android)
   */
  isMobile: (): boolean => {
    return Capacitor.isNativePlatform();
  },

  /**
   * Check if running on iOS
   */
  isIOS: (): boolean => {
    return Capacitor.getPlatform() === 'ios';
  },

  /**
   * Check if running on Android
   */
  isAndroid: (): boolean => {
    return Capacitor.getPlatform() === 'android';
  },

  /**
   * Check if running in web browser
   */
  isWeb: (): boolean => {
    return Capacitor.getPlatform() === 'web';
  },

  /**
   * Get the current platform name
   */
  getPlatform: (): string => {
    return Capacitor.getPlatform();
  },

  /**
   * Check if a specific Capacitor plugin is available
   */
  isPluginAvailable: (pluginName: string): boolean => {
    return Capacitor.isPluginAvailable(pluginName);
  },
};

/**
 * Hook to detect if running in native mobile app context
 * Usage: const isMobile = useIsMobile();
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(platform.isMobile());
  }, []);

  return isMobile;
}

/**
 * Hook to detect if running in Capacitor native app
 * Usage: const isNativeApp = useIsNativeApp();
 */
export function useIsNativeApp(): boolean {
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    setIsNative(platform.isMobile());
  }, []);

  return isNative;
}

/**
 * Hook to get current platform
 * Usage: const currentPlatform = usePlatform();
 */
export function usePlatform(): string {
  const [currentPlatform, setCurrentPlatform] = useState('web');

  useEffect(() => {
    setCurrentPlatform(platform.getPlatform());
  }, []);

  return currentPlatform;
}
