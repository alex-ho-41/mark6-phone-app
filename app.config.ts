import { ExpoConfig, ConfigContext } from 'expo/config';

const { version } = require('./package.json');

export default ({ config }: ConfigContext): ExpoConfig => ({
  name: 'MarkSixLuckyDraw',
  slug: 'mark6-phone-app',
  version,
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#450a0a',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.ahohty.marksixluckydraw',
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: 'com.ahohty.marksixluckydraw',
    versionCode: 6,
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#450a0a',
    },
    permissions: [
      'android.permission.INTERNET',
      'android.permission.ACCESS_NETWORK_STATE',
    ],
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    [
      'react-native-google-mobile-ads',
      {
        androidAppId: process.env.EXPO_PUBLIC_ADMOB_ANDROID_APP_ID,
        iosAppId: process.env.EXPO_PUBLIC_ADMOB_IOS_APP_ID,
      },
    ],
  ],
  extra: {
    eas: {
      projectId: '1f49928d-5c38-422e-9a8b-79249c918f63',
    },
  },
  owner: 'ahohty',
});
