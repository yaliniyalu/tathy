import {AdMob, BannerAdPosition, BannerAdSize} from "@capacitor-community/admob";

class AdService {
  constructor() {
  }

  async initialize() {
    const { status } = await AdMob.trackingAuthorizationStatus();
    await AdMob.initialize({
      requestTrackingAuthorization: true,
      testingDevices: ['2077ef9a63d2b398840261c8221a0c9b'],
      // initializeForTesting: true,
    });
  }

  async showBanner() {
    const options = {
      adId: process.env.BANNER_AD_ID,
      adSize: BannerAdSize.BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
    };
    return AdMob.showBanner(options);
  }

  async hideBanner() {
    return AdMob.hideBanner()
  }

  async showInterstitial() {
    const options = {
      adId: process.env.INTERSTITIAL_AD_ID
    };

    await AdMob.prepareInterstitial(options);
    await AdMob.showInterstitial();
  }
}

export default AdService
