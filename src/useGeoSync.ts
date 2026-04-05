// src/useGeoSync.ts

import { useState, useCallback, useEffect } from 'react';
import * as Location from 'expo-location';
import { BACKGROUND_LOCATION_TASK, locationQueue } from './backgroundTask';
import { SyncConfig, UseGeoSyncResult } from './types';
import { useGeoPermissions } from './useGeoPermissions';
import { setTaskConfig } from './backgroundTask'; // <-- add this to your imports
export function useGeoSync(config?: SyncConfig): UseGeoSyncResult {
  // Bring in our custom permission hook
  const { permissionState, requestPermissions } = useGeoPermissions();
  
  const [isTracking, setIsTracking] = useState(false);
  const [queueLength, setQueueLength] = useState(locationQueue.length);

  useEffect(() => {
    if (config) {
      setTaskConfig(config);
    }
  }, [config]);

  const startTracking = useCallback(async () => {
    if (permissionState !== 'granted_background' && permissionState !== 'granted_foreground') {
      console.warn('[use-geo-sync] Cannot start tracking. Permissions not granted.');
      return;
    }

    try {
      await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
        // Balanced accuracy saves battery compared to Highest
        accuracy: Location.Accuracy.Balanced, 
        timeInterval: config?.syncIntervalMs || 10000, // Ping every 10 seconds
        distanceInterval: 10, // Or ping every 10 meters
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: "Location Sync Active",
          notificationBody: "Tracking your route in the background.",
        }
      });
      setIsTracking(true);
    } catch (error) {
      console.error('[use-geo-sync] Failed to start background tracking:', error);
    }
  }, [permissionState, config]);

  const stopTracking = useCallback(async () => {
    try {
      const hasTask = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
      if (hasTask) {
        await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
      }
      setIsTracking(false);
    } catch (error) {
      console.error('[use-geo-sync] Failed to stop tracking:', error);
    }
  }, []);

  return {
    permissionState,
    requestPermissions,
    startTracking,
    stopTracking,
    isTracking,
    queueLength
  };
}