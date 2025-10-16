import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'Encuestas_frontend',
  webDir: 'www',
  server: {
    cleartext: true,
    allowNavigation: [
      'http://192.168.1.204:1337'
    ]
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
