import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Expo Go cannot load native ad modules
export const isExpoGo = Constants.appOwnership === 'expo';

const TEST_BANNER = 'ca-app-pub-3940256099942544/6300978111';
const TEST_INTERSTITIAL = 'ca-app-pub-3940256099942544/1033173712';

const PROD_IDS = {
  android: {
    banner: 'ca-app-pub-8422835846268677/8780492501',
    interstitial: 'ca-app-pub-8422835846268677/8812640887',
  },
  ios: {
    banner: 'ca-app-pub-8422835846268677/9082581112',
    interstitial: 'ca-app-pub-8422835846268677/3806203702',
  },
};

const FORCE_TEST_ADS = false;

const platform = Platform.OS === 'ios' ? 'ios' : 'android';

export const AD_UNIT_IDS = {
  banner: (__DEV__ || FORCE_TEST_ADS)
    ? TEST_BANNER
    : PROD_IDS[platform].banner,
  interstitial: (__DEV__ || FORCE_TEST_ADS)
    ? TEST_INTERSTITIAL
    : PROD_IDS[platform].interstitial,
};

// Show interstitial every N generates
export const INTERSTITIAL_FREQUENCY = 5;
