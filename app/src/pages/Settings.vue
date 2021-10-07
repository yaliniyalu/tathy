<template>
  <q-page class="q-pa-md bg-white">
    <AppHeader title="Settings"/>

    <q-list bordered separator class="bg-white">
      <q-item clickable v-ripple>
        <q-item-section avatar>
          <q-icon name="notifications" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Notifications</q-item-label>
          <q-item-label caption>Allow push notification</q-item-label>
        </q-item-section>
        <q-item-section side top>
          <q-toggle color="primary" v-model="notification" :model-value="notification" :val="true" />
        </q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>

<script setup>
import AppHeader from "components/AppHeader";
import {onMounted, ref, watch} from "vue";
import {Storage} from "@capacitor/storage"
import {api} from "boot/axios";

const notification = ref(true)

onMounted(async () => {
  const { value } = await Storage.get({ key: 'settings.notification' });
  notification.value = value === "1"
})

watch(notification, async () => {
  const val = notification.value ? "1" : "0"
  await Storage.set({ key: 'settings.notification', value: val });

  const { deviceId } = await Storage.get({ key: 'device-id' });
  const fcmId = notification.value ? "" : null

  const res = await api.patch("/fcm", { deviceId, fcmId })
  await Storage.set({ key: 'device-id', value: res.data.data.deviceId });
})

</script>

<style lang="scss" scoped>

</style>
