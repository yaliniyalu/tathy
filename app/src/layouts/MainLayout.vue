<template>
  <q-layout view="hHh lpR fFf">

    <q-page-container>
      <router-view />
    </q-page-container>

  </q-layout>
</template>

<script setup>
import {onMounted} from "vue";
import AdService from "src/services/AdService";


onMounted(async () => {
  try {
    // const adService = new AdService()
    // await adService.initialize()
    // await adService.showBannerAd()
  } catch (e) {
  }
})


</script>

<style lang="scss" scoped>

</style>
