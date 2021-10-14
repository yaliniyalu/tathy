<template>
  <q-page class="q-pa-md">
    <AppHeader title="Tags"/>

    <q-inner-loading :showing="loading">
      <q-spinner-bars size="50px" color="primary" />
    </q-inner-loading>

    <p class="text-grey text-center" v-if="!loading && !tags.length">No tags found</p>

    <q-list bordered separator v-if="tags.length">
      <q-item clickable v-ripple v-for="tag in tags" :to="tag.items > 0 ? '/?tag=' + tag.tag : null">
        <q-item-section>
          <q-item-label>{{ tag.tag }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <span>{{ tag.items }} facts</span>
        </q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>

<script setup>
import AppHeader from "components/AppHeader";
import {onMounted, ref} from "vue";
import {api} from "boot/axios";

const tags = ref([])
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    const res = await api.get('tags')
    tags.value = res.data.data.tags
  } finally {
    loading.value = false
  }
})

</script>

<style lang="scss" scoped>

</style>
