import Constants from 'expo-constants';
import { Platform } from 'react-native';

type AdMobExtra = {
  banner?: string;
  interstitial?: string;
  rewarded?: string;
  bannerAndroid?: string;
  bannerIos?: string;
  interstitialAndroid?: string;
  interstitialIos?: string;
  rewardedAndroid?: string;
  rewardedIos?: string;
};

function getAdMobExtra(): AdMobExtra {
  const extra = (Constants.expoConfig?.extra ?? {}) as { admob?: AdMobExtra };
  return extra.admob ?? {};
}

const extra = getAdMobExtra();
const isExpoGo =
  Constants.appOwnership === 'expo' ||
  Constants.executionEnvironment === 'storeClient';

function resolveUnitId(params: {
  platformSpecific?: string;
  shared?: string;
  testId: string;
}) {
  if (__DEV__) return params.testId;
  return params.platformSpecific ?? params.shared ?? params.testId;
}

export const isMobileAdsSupported = Platform.OS === 'android' || Platform.OS === 'ios';
export const isAdMobRuntimeSupported = isMobileAdsSupported && !isExpoGo;

const TEST_IDS = {
  banner: 'ca-app-pub-2651344814474355/3020128857',
  interstitial: 'ca-app-pub-2651344814474355/2226610291',
  rewarded: 'ca-app-pub-2651344814474355/5196388567',
};

export const ADMOB_UNIT_IDS = {
  banner: resolveUnitId({
    platformSpecific: Platform.OS === 'android' ? extra.bannerAndroid : extra.bannerIos,
    shared: extra.banner,
    testId: TEST_IDS.banner,
  }),
  interstitial: resolveUnitId({
    platformSpecific: Platform.OS === 'android' ? extra.interstitialAndroid : extra.interstitialIos,
    shared: extra.interstitial,
    testId: TEST_IDS.interstitial,
  }),
  rewarded: resolveUnitId({
    platformSpecific: Platform.OS === 'android' ? extra.rewardedAndroid : extra.rewardedIos,
    shared: extra.rewarded,
    testId: TEST_IDS.rewarded,
  }),
};
