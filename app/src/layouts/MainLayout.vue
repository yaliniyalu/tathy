<template>
  <q-layout view="hHh lpR fFf">

    <q-page-container>
      <router-view/>
    </q-page-container>

  </q-layout>
</template>

<script setup>
import {onMounted} from "vue";
import {useQuasar} from "quasar";

const quasar = useQuasar()

onMounted(() => {
  quasar.dark.set(true)
})


</script>

<style lang="scss" scoped>

</style>
