import {StatusBar, Style} from "@capacitor/status-bar";

class AppService {
}

AppService.setTheme = async function (color, isLight, haveNavBar) {
  await StatusBar.setStyle({ style: (isLight ? Style.Light : Style.Dark) });
  await StatusBar.setBackgroundColor({color: color})

  window.NavigationBar?.backgroundColorByHexString(color, isLight);

  if (!haveNavBar) {
    window.NavigationBar?.hide();
  } else {
    window.NavigationBar?.show();
  }
}

export default AppService
