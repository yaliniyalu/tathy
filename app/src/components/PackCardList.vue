<template>
  <q-item clickable v-ripple @click="gotoPackDetails">
    <q-item-section top avatar rounded>
      <q-img :src="getAssetsUrl(pack.image, 'packs')"/>
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ pack.name }}</q-item-label>
      <q-item-label caption lines="2">
        <q-badge color="secondary" :label="pack.category[0].name"/>
      </q-item-label>
    </q-item-section>

    <q-item-section side top>
      <q-item-label caption>{{ learnedCount && !isCompleted ? learnedCount + '/' : '' }}{{ pack.items }} facts</q-item-label>
      <q-icon name="star" color="warning" v-if="pack.purchase.enabled"/>
    </q-item-section>
  </q-item>
</template>

<script setup>
import {useRouter} from "vue-router";
import {computed, onMounted, ref, toRef} from "vue";
import PackService from "src/services/PackService";
import {getAssetsUrl} from "src/utils";

const router = useRouter()

const props = defineProps({
  pack: {
    type: Object,
    required: true
  }
});

const pack = toRef(props, 'pack')
const learnedCount = ref(0)

const isCompleted = computed(() => {
  return learnedCount.value === pack.value.items
})

onMounted(async () => {
  const p = await PackService.getPack(pack.value._id)
  if (p) {
    learnedCount.value = p.learned_count
  }
})

const gotoPackDetails = function () {
  router.push('/pack/' + pack.value._id)
}
</script>

<style lang="scss" scoped>

</style>
