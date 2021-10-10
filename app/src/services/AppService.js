import {Storage} from "@capacitor/storage";
import {api} from "boot/axios";
import {StatusBar, Style} from "@capacitor/status-bar";

class AppService {
  async registerApp() {
    const {deviceId} = await Storage.get({key: 'device-id'});
    if (!deviceId) {
      const res = await api.patch("/fcm")
      await Storage.set({key: 'device-id', value: res.data.data.deviceId});
      return deviceId
    }
  }
}

AppService.setTheme = async function (color, isLight, haveNavBar) {
  await StatusBar.setStyle({ style: (isLight ? Style.Light : Style.Dark) });
  await StatusBar.setBackgroundColor({color: color})

  window.NavigationBar?.backgroundColorByHexString(color, isLight);

/*  if (!haveNavBar) {
    window.NavigationBar?.hide();
  } else {
    window.NavigationBar?.show();
  }*/
}

export default AppService
