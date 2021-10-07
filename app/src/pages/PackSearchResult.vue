<template>
  <q-page class="q-pa-md bg-white">
    <AppHeader/>

    <p class="text-grey text-center" v-if="!loading && !packs.length">No packs found</p>

    <q-list bordered>
      <PackCardList :pack="pack" v-for="pack in packs"/>
    </q-list>
  </q-page>
</template>

<script setup>

import AppHeader from "components/AppHeader";
import PackCard from "components/PackCard";
import {onMounted, ref} from "vue";
import {api} from "boot/axios";
import {getAssetsUrl} from "src/utils";
import PackCardList from "components/PackCardList";

const loading = ref(false)
const packs = ref([])

onMounted(async () => {
  loading.value = true
  try {
    const res = await api.post("packs/search", {q: 'p'})
    packs.value = res.data.data.packs
  } catch (e) {
  } finally {
    loading.value = true
  }
})
</script>

<style lang="scss" scoped>

</style>
