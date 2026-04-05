// src/index.ts

export * from './types';
export { useGeoPermissions } from './useGeoPermissions';
export { useGeoSync } from './useGeoSync';
export { BACKGROUND_LOCATION_TASK, locationQueue } from './backgroundTask'; // <-- ADD locationQueue