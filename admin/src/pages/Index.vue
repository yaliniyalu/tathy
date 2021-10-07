<template>
  <q-page class="flex flex-center">
    <q-img :src="require('src/assets/logo.svg')" style="width: 50%"/>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'PageIndex'
})
</script>
