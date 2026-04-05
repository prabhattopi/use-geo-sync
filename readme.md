# use-geo-sync 🌍

A plug-and-play, offline-first background location tracking and syncing toolkit for React Native and Expo. 

Handling iOS/Android background permissions, app state, and network drops is a massive headache. `use-geo-sync` abstracts all that boilerplate into a single, strictly-typed React Hook with a built-in offline queue.

## ✨ Features
- **📱 Bulletproof Permissions:** Automatically handles the strict Foreground -> Background permission cascade on both iOS and Android.
- **🔋 Battery Optimized:** Uses balanced accuracy and headless task management to save battery life.
- **📡 Offline-First Queuing:** If the network drops, coordinates are safely queued locally. When the connection returns, the queue is automatically batched and synced to your backend.
- **🧭 Live Navigation Ready:** Exposes compass headings and the raw local queue to build Uber-style live map arrows.

## 📦 Installation

Install the package via npm or yarn:

```bash
npm install use-geo-sync
```
Important: This package relies on Expo modules under the hood. You must install the peer dependencies:

```
npx expo install expo-location expo-task-manager
```

# 🚀 Standard API Sync (Quick Start)
Here is how to set up automatic background tracking that syncs to your database in batches:
```
import { View, Text, Button } from 'react-native';
import { useGeoSync } from 'use-geo-sync';

export default function TrackingScreen() {
  const { permissionState, requestPermissions, startTracking, stopTracking, isTracking } = useGeoSync({
    syncEndpoint: '[https://your-api.com/api/location-sync](https://your-api.com/api/location-sync)', 
    batchSize: 20, 
  });

  return (
    <View>
      <Text>Permissions: {permissionState}</Text>
      {permissionState !== 'granted_background' && (
        <Button title="Grant Permissions" onPress={requestPermissions} />
      )}
      <Button 
        title={isTracking ? "Stop" : "Start"} 
        onPress={isTracking ? stopTracking : startTracking} 
      />
    </View>
  );
}
```

## 🗺️ Advanced Use Cases (Offline & Maps)

If you don't provide a `syncEndpoint`, the package acts as a powerful local GPS engine. You can import the raw `locationQueue` to build complex map features.

### 1. The Uber-Style Live Navigation Arrow
Keep a map marker perfectly locked onto the user's position and rotation, even if the app goes into the background.

```
import { useEffect, useState } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { useGeoSync, locationQueue } from 'use-geo-sync';

export default function LiveMap() {
  const { queueLength } = useGeoSync({ batchSize: 1000 }); // High batch size for local use
  const [currentLoc, setCurrentLoc] = useState(null);

  useEffect(() => {
    if (queueLength > 0) {
      setCurrentLoc(locationQueue[locationQueue.length - 1]);
    }
  }, [queueLength]);

  return (
    <MapView style={{ flex: 1 }}>
      {currentLoc && (
        <Marker
          coordinate={{ latitude: currentLoc.latitude, longitude: currentLoc.longitude }}
          // Rotate the custom arrow image based on user's compass heading
          style={{ transform: [{ rotate: `${currentLoc.heading || 0}deg` }] }}
          image={require('./assets/arrow.png')} 
        />
      )}
    </MapView>
  );
}
```

### 2. Offline Breadcrumb Trails
Draw a line of exactly where the user has walked today, entirely offline.

```
import MapView, { Polyline } from 'react-native-maps';
import { useGeoSync, locationQueue } from 'use-geo-sync';

export function MapScreen() {
  const { isTracking } = useGeoSync({ batchSize: 1000 }); 

  return (
    <MapView style={{ flex: 1 }}>
      <Polyline coordinates={locationQueue} strokeColor="#000" strokeWidth={4} />
    </MapView>
  );
}
```
## ⚙️ Configuration Options (SyncConfig)

When calling `useGeoSync(config)`, you can pass the following options:

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `syncEndpoint` | `string` | `undefined` | The backend API URL to POST batched coordinates to. |
| `batchSize` | `number` | `20` | How many location points to collect before syncing. |
| `syncIntervalMs` | `number` | `10000` | Time in milliseconds between GPS pings. |

## 📜 License

MIT