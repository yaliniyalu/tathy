<template>
  <q-page class="q-pa-md bg-white">
    <AppHeader :title="title"/>

      <div class=" row q-col-gutter-md">
        <div class="col-xs-4 col-sm-3 col-md-2" v-for="pack in packs">
          <PackCard :pack="pack"/>
        </div>
      </div>
  </q-page>
</template>

<script setup>
import AppHeader from "components/AppHeader";
import {onMounted, ref} from "vue";
import {api} from "boot/axios";
import {useQuasar} from "quasar";
import PackCard from "components/PackCard";
import {useRoute} from "vue-router";

const title = ref()
const packs = ref([])

const quasar = useQuasar()
const route = useRoute()

const id = route.params.id

title.value = route.query.name

onMounted(async () => {
  // quasar.loading.show()
  try {
    const res = await api.get(`/category/${id}/packs`)
    packs.value = res.data.data.packs
  } finally {
    quasar.loading.hide()
  }
})

</script>

<style lang="scss" scoped>

</style>
