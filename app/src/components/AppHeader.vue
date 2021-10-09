<template>
  <q-header class="bg-white text-white">
    <q-toolbar>
      <q-btn color="primary" dense flat round icon="arrow_back" @click="goBack"/>
      <q-toolbar-title class="text-primary"><b class="text-primary title" v-if="title">{{ title }}</b></q-toolbar-title>
    </q-toolbar>
  </q-header>
</template>

<script setup>
import {useRouter} from "vue-router";

const props = defineProps({
  title: {
    type: String,
    required: false,
    default: null
  }
});

const router = useRouter()

function goBack() {
  router.go(-1)
}
</script>

<style lang="scss" scoped>
.title {
  font-size: 18px;
  line-height: 1;
}
</style>
