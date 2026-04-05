// src/useGeoPermissions.ts

import { useState, useCallback, useEffect } from 'react';
import * as Location from 'expo-location';
import { PermissionState } from './types';

export function useGeoPermissions() {
  const [permissionState, setPermissionState] = useState<PermissionState>('idle');

  // Check the current status silently without triggering a system popup
  const checkPermissions = useCallback(async () => {
    try {
      const { status: fgStatus } = await Location.getForegroundPermissionsAsync();
      
      if (fgStatus === 'granted') {
        const { status: bgStatus } = await Location.getBackgroundPermissionsAsync();
        setPermissionState(bgStatus === 'granted' ? 'granted_background' : 'granted_foreground');
      } else if (fgStatus === 'denied') {
        setPermissionState('denied');
      } else {
        setPermissionState('idle');
      }
    } catch (error) {
      console.error("[use-geo-sync] Error checking permissions:", error);
      setPermissionState('denied');
    }
  }, []);

  // Run the silent check on mount
  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  // The actual request function the developer will call
  const requestPermissions = useCallback(async () => {
    setPermissionState('requesting');
    
    try {
      // 1. MUST request foreground first
      const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();

      if (fgStatus !== 'granted') {
        setPermissionState('denied');
        return; // Stop here if they say no
      }

      // 2. Now safe to request background
      const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();

      if (bgStatus === 'granted') {
        setPermissionState('granted_background');
      } else {
        // They allowed app to use location while open, but not in background
        setPermissionState('granted_foreground');
      }
    } catch (error) {
      console.error('[use-geo-sync] Failed to request location permissions:', error);
      setPermissionState('denied');
    }
  }, []);

  return { 
    permissionState, 
    requestPermissions, 
    checkPermissions 
  };
}