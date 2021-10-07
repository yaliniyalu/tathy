<template>
  <q-btn flat color="primary" class="flex btn" style="width: 100%" @click="onClick">
    <div class="col text-left flex justify-between">
      <span class="text-bold">{{ props.label }}</span>
      <q-icon name="arrow_forward" v-if="props.to"/>
    </div>
  </q-btn>
</template>

<script setup>
import {useRouter} from "vue-router";

const router = useRouter()

const props = defineProps({
  label: {
    type: String,
    required: true
  },
  to: {
    type: String,
    required: false,
    default: null
  }
});

const emit = defineEmits(['click'])

function onClick() {
  if (props.to) {
    router.push(props.to)
  }

  emit('click')
}
</script>

<style lang="scss" scoped>
.btn {
  width: 100%;
  padding: 4px;
}
</style>
