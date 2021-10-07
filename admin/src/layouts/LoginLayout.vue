<template>
  <q-layout view="lhr lpr lfr">

    <q-page-container>
      <router-view />
    </q-page-container>

  </q-layout>
</template>

<script>
import {defineComponent} from "vue";

export default defineComponent({
  name: 'LoginLayout'
})
</script>

<style scoped>

</style>
