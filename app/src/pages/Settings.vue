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

      <q-item clickable v-ripple @click="promptCurrentFact">
        <q-item-section avatar>
          <q-icon name="tag" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Current Fact</q-item-label>
          <q-item-label caption>Will continue from this fact</q-item-label>
        </q-item-section>
        <q-item-section side top>
          <span>#{{ currentFact }}</span>
        </q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>

<script setup>
import AppHeader from "components/AppHeader";
import {onMounted, ref, watch} from "vue";
import {useStore} from "vuex";
import {useQuasar} from "quasar";
import {Storage} from "@capacitor/storage"
import {api} from "boot/axios";

const store = useStore()
const quasar = useQuasar()

const notification = ref(true)
const currentFact = ref(1)
const totalFacts = store.state.app.totalFacts

onMounted(async () => {
  const { value } = await Storage.get({ key: 'settings.notification' });
  notification.value = value === "1"

  const currentPosition = await Storage.get({ key: 'data.currentFact' });
  currentFact.value = parseInt(currentPosition.value ?? 1)
})

watch(notification, async () => {
  const val = notification.value ? "1" : "0"
  await Storage.set({ key: 'settings.notification', value: val });

  const { deviceId } = await Storage.get({ key: 'device-id' });
  const fcmId = notification.value ? "" : null

  const res = await api.patch("/fcm", { deviceId, fcmId })
  await Storage.set({ key: 'device-id', value: res.data.data.deviceId });
})

function promptCurrentFact () {
  quasar.dialog({
    title: 'Current Fact',
    message: 'Will continue from this fact next time.',
    html: true,
    prompt: {
      model: currentFact.value,
      type: 'text',
      isValid: v => {
        if (!v) return false
        if (!(!isNaN(v) && !isNaN(parseInt(v)))) return false
        return !(v < 0 || v > totalFacts);
      },
      outlined: true,
      stackLabel: true,
      hint: "Values between 0 and " + totalFacts
    },
    cancel: true,
    persistent: true
  }).onOk(async data => {
    currentFact.value = parseInt(data)
    await Storage.set({ key: 'data.currentFact', value: currentFact.value.toString() });
  })
}


</script>

<style lang="scss" scoped>

</style>
