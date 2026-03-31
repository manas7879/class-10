import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nexuschats.app',
  appName: 'Nexus Chat',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
