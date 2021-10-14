<template>
  <q-page class="q-pa-md">
    <AppHeader title="About"/>

    <div class="text-center">
      <img :src="require('src/assets/logo.svg')" alt="logo"/>
    </div>

    <div class="text-center">
      <p class="text-grey">version {{ version }}</p>

      <q-separator class="q-mb-md"/>

      <b>Developed By</b>
      <h6 class="q-mt-sm text-secondary">Samar Yalini</h6>
    </div>
  </q-page>
</template>

<script setup>

import AppHeader from "components/AppHeader";
import {App} from "@capacitor/app";
import {onMounted, ref} from "vue";

const version = ref("")

onMounted(async () => {
  const info = await App.getInfo()
  version.value = info.version
})


</script>

<style lang="scss" scoped>

</style>
