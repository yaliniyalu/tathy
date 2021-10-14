import {Storage} from "@capacitor/storage";
import {api} from "boot/axios";

export async function loadSettings(context) {
  const isIntroShown = await Storage.get({key: 'intro'});
  const swiperDirection = await Storage.get({key: 'settings.swiperDirection'});
  const layoutMirror = await Storage.get({key: 'settings.layoutMirror'});
  const notificationEnabled = await Storage.get({key: 'settings.notificationEnabled'});
  const currentFact = await Storage.get({key: 'data.currentFact'});
  const deviceId = await Storage.get({key: 'device-id'});

  await setIsIntroShown(context, isIntroShown.value ? isIntroShown.value === 'true' : false)
  await setSwiperDirection(context, swiperDirection.value ?? 'vertical')
  await setLayoutMirror(context, layoutMirror.value ? layoutMirror.value === 'true' : false)
  await setNotificationEnabled(context, notificationEnabled.value ? notificationEnabled.value === 'true' : true)
  await setCurrentFact(context, currentFact.value ? parseInt(currentFact.value) : 0)
  await setDeviceId(context, deviceId.value ?? null)
}

export async function setIsIntroShown(context, isShown) {
  await Storage.set({ key: 'intro', value: isShown.toString() })
  context.commit("setIsIntroShown", isShown)
}

export async function setSwiperDirection(context, direction) {
  await Storage.set({ key: 'settings.swiperDirection', value: direction })
  context.commit("setSwiperDirection", direction)
}

export async function setLayoutMirror(context, isMirror) {
  await Storage.set({ key: 'settings.layoutMirror', value: isMirror.toString() })
  context.commit("setLayoutMirror", isMirror)
}

export async function setNotificationEnabled(context, isEnabled) {
  await Storage.set({ key: 'settings.notificationEnabled', value: isEnabled.toString() })
  context.commit("setNotificationEnabled", isEnabled)
  // to do update fcm
}

export async function setCurrentFact(context, current) {
  await Storage.set({ key: 'data.currentFact', value: current.toString() })
  context.commit("setCurrentFact", current)
}

export async function setDeviceId(context, deviceId) {
  await Storage.set({ key: 'device-id', value: deviceId })
  context.commit("setDeviceId", deviceId)
}

export async function setTotalFacts(context, total) {
  context.commit("setTotalFacts", total)
}

export async function registerDevice(context) {
  if (!context.state.deviceId) {
    const res = await api.patch("/fcm")
    context.commit('setDeviceId', res.data.data.deviceId)
  }
}

export async function setIsBannerAdShown(context, isShown) {
  context.commit("setIsBannerAdShown", isShown)
}

export async function setFacts(context, facts) {
  context.commit("setFacts", facts)
}
