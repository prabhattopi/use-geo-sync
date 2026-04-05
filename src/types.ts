// src/types.ts

import * as Location from 'expo-location';

export interface GeoPoint {
  id: string; 
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy: number | null;
  speed: number | null;
  heading: number | null; // <-- ADD THIS NEW LINE
}

export interface SyncConfig {
  batchSize?: number; 
  syncEndpoint?: string; 
  syncIntervalMs?: number; 
  retryLimit?: number; 
}

export type PermissionState = 
  | 'idle' 
  | 'requesting' 
  | 'granted_foreground' 
  | 'granted_background' 
  | 'denied';

export interface UseGeoSyncResult {
  permissionState: PermissionState;
  requestPermissions: () => Promise<void>;
  startTracking: () => Promise<void>;
  stopTracking: () => Promise<void>;
  isTracking: boolean;
  queueLength: number; 
}