import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Expo Go cannot load native ad modules
export const isExpoGo = Constants.appOwnership === 'expo';

const TEST_BANNER = 'ca-app-pub-3940256099942544/6300978111';
const TEST_INTERSTITIAL = 'ca-app-pub-3940256099942544/1033173712';

const PROD_IDS = {
  android: {
    banner: process.env.EXPO_PUBLIC_ADMOB_ANDROID_BANNER!,
    interstitial: process.env.EXPO_PUBLIC_ADMOB_ANDROID_INTERSTITIAL!,
  },
  ios: {
    banner: process.env.EXPO_PUBLIC_ADMOB_IOS_BANNER!,
    interstitial: process.env.EXPO_PUBLIC_ADMOB_IOS_INTERSTITIAL!,
  },
};

// Read from env — set to 'true' in .env for dev/preview EAS builds
const FORCE_TEST_ADS = process.env.EXPO_PUBLIC_FORCE_TEST_ADS === 'true';

const platform = Platform.OS === 'ios' ? 'ios' : 'android';

export const AD_UNIT_IDS = {
  banner: (__DEV__ || FORCE_TEST_ADS || isExpoGo)
    ? TEST_BANNER
    : PROD_IDS[platform].banner,
  interstitial: (__DEV__ || FORCE_TEST_ADS || isExpoGo)
    ? TEST_INTERSTITIAL
    : PROD_IDS[platform].interstitial,
};

// Show interstitial every N generates
export const INTERSTITIAL_FREQUENCY = 5;
