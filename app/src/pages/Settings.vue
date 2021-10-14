<template>
  <q-page class="q-pa-md">
    <AppHeader title="Settings"/>

    <q-list bordered separator>
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
          <span>#{{ currentFact + 1 }}</span>
        </q-item-section>
      </q-item>

      <q-item clickable v-ripple @click="promptSwiperDirection">
        <q-item-section avatar>
          <q-icon name="import_export" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Swipe Direction</q-item-label>
          <q-item-label caption>Direction of swipe to goto next/previous fact</q-item-label>
        </q-item-section>
        <q-item-section side top>
          <span>{{ swiperDirection }}</span>
        </q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>

<script setup>
import AppHeader from "components/AppHeader";
import {computed} from "vue";
import {useStore} from "vuex";
import {useQuasar} from "quasar";

const store = useStore()
const quasar = useQuasar()

const totalFacts = store.state.app.totalFacts
const currentFact = computed({
  set: (v) => store.dispatch('app/setCurrentFact', v),
  get: () => store.state.app.currentFact
})
const notification = computed({
  set: (v) => store.dispatch('app/setNotificationEnabled', v),
  get: () => store.state.app.notificationEnabled
})
const swiperDirection = computed({
  set: (v) => store.dispatch('app/setSwiperDirection', v),
  get: () => store.state.app.swiperDirection
})

function promptCurrentFact () {
  quasar.dialog({
    title: 'Current Fact',
    message: 'Will continue from this fact next time.',
    html: true,
    prompt: {
      model: currentFact.value + 1,
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
    currentFact.value = parseInt(data) - 1
  })
}

function promptSwiperDirection () {
  quasar.dialog({
    title: 'Swipe Direction',
    options: {
      type: 'radio',
      model: swiperDirection.value,
      items: [
        { label: 'Vertical', value: 'vertical' },
        { label: 'Horizontal', value: 'horizontal' },
      ]
    },
    cancel: true,
    persistent: true
  }).onOk(data => {
    swiperDirection.value = data
  })
}
</script>

<style lang="scss" scoped>

</style>
