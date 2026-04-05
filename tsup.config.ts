import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true, // Generates types
  clean: true, // Cleans dist folder before build
  external: ['react', 'expo-location', 'expo-task-manager'], // Don't bundle these!
});