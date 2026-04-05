// src/backgroundTask.ts

import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { GeoPoint, SyncConfig } from './types';

export const BACKGROUND_LOCATION_TASK = 'BACKGROUND_LOCATION_TASK';

// In-memory queue
export let locationQueue: GeoPoint[] = [];

// We need a way to store the developer's config globally so the background task can read it
let activeConfig: SyncConfig = { batchSize: 20 }; 

// Function to update the config from the React Hook
export const setTaskConfig = (config: SyncConfig) => {
  activeConfig = { ...activeConfig, ...config };
};

TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.error('[use-geo-sync] Background task error:', error.message);
    return;
  }
  
  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    
    // 1. Transform Expo's object
const newPoints: GeoPoint[] = locations.map(loc => ({
      id: `${loc.timestamp}-${Math.random().toString(36).substr(2, 9)}`,
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      timestamp: loc.timestamp,
      accuracy: loc.coords.accuracy,
      speed: loc.coords.speed,
      heading: loc.coords.heading // <-- ADD THIS NEW LINE
    }));

    // 2. Add to Queue
    locationQueue.push(...newPoints);
    console.log(`[use-geo-sync] 📍 Caught ${newPoints.length} points. Queue size: ${locationQueue.length}`);

    // 3. THE MAGIC: Check if we need to sync!
    const batchLimit = activeConfig.batchSize || 20;
    
    if (activeConfig.syncEndpoint && locationQueue.length >= batchLimit) {
      console.log(`[use-geo-sync] 🚀 Queue hit limit (${batchLimit}). Syncing to backend...`);
      
      try {
        // Send the data to the developer's backend
        const response = await fetch(activeConfig.syncEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ locations: locationQueue }),
        });

        if (response.ok) {
          console.log('[use-geo-sync] ✅ Sync successful! Clearing queue.');
          // 4. Clear the queue ONLY if the network request succeeds
          locationQueue = []; 
        } else {
          console.warn(`[use-geo-sync] ⚠️ Sync failed with status: ${response.status}. Keeping data in queue.`);
        }
      } catch (networkError) {
        // If they are driving through a tunnel and lose 5G, the fetch will fail.
        // We catch the error and do NOT clear the queue. It will try again next time.
        console.warn('[use-geo-sync] 🔌 Network offline. Points saved in queue for next sync.');
      }
    }
  }
});