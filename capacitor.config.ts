import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.basketball.scoreboard',
  appName: '篮球记分牌 Pro',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  android: {
    backgroundColor: '#020617',
    allowMixedContent: true
  },
  plugins: {
    StatusBar: {
      overlaysWebView: true,
      style: 'DARK',
      backgroundColor: '#00000000'
    }
  }
};

export default config;

