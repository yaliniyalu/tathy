<template>
<q-page class="q-pa-md bg-white">
  <AppHeader title="Category"/>
  <q-list bordered separator class="bg-white">
      <q-item clickable v-ripple v-for="category in categories" :to="`/category/${category._id}/packs?name=${category.name}`">
        <q-item-section avatar v-if="category.icon">
          <q-icon :name="category.icon" />
        </q-item-section>
        <q-item-section>{{ category.name }}</q-item-section>
      </q-item>
  </q-list>
</q-page>
</template>

<script setup>
import {onMounted, ref} from "vue";
import {api} from "boot/axios";
import AppHeader from "components/AppHeader";

const categories = ref([])

onMounted(async () => {
  const res = await api.get("category")
  categories.value = res.data.data.category
})
</script>

<style lang="scss" scoped>

</style>
