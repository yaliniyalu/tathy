<template>
  <q-page class="q-pa-md">
    <AppHeader title="Menu"/>

    <q-list bordered separator>
      <q-item clickable v-ripple v-for="item in list" :to="item.to">
        <q-item-section avatar>
          <q-icon :name="item.icon" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ item.name }}</q-item-label>
          <q-item-label caption>{{ item.caption }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>

<script setup>
import AppHeader from "components/AppHeader";

const list = [
  { name: 'Tags', icon: 'local_offer', caption: "Search or view facts by tags", to: "/tags" },
  { name: "Settings", icon: 'settings', caption: 'Manage your settings', to: '/settings' },
  { name: "About", icon: 'format_quote', caption: 'Info about the app', to: '/about' }
]
</script>

<style lang="scss" scoped>

</style>
