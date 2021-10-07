<template>
  <div class="pack-card" @click="gotoPackDetails">
    <q-img class="pack-thumb" :src="getAssetsUrl(pack.image, 'packs')" :alt="pack.name" fit="cover"/>
    <p class="pack-title">{{ pack.name }}</p>
    <p class="pack-size">{{ learnedCount && !isCompleted ? learnedCount + '/' : '' }}{{ pack.items }} facts</p>

    <q-icon class="icon-viewed" color="secondary" name="visibility" v-if="isCompleted"/>
    <q-icon class="icon-premium" color="warning" name="star" v-if="pack.purchase.enabled"/>
  </div>
</template>

<script setup>
import {useRouter} from "vue-router";
import {getAssetsUrl} from "src/utils";
import {computed, onMounted, ref, toRef} from "vue";
import PackService from "src/services/PackService";

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

<style lang="scss">
.pack-card {
  //box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
  //background: #fff;
  cursor: pointer;
  position: relative;

  &:hover, &:active, &:focus {
    //box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
  }

  .pack-thumb {
    width: 100%;
    //border-radius: 10px 10px 0 0;
    border-radius: 10px;
    user-select: none;
  }

  .pack-title {
    line-height: 1.2;
    font-size: 12px;
    //padding: 5px;
    margin: 5px 0 0;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    max-height: 42px;
    user-select: none;
  }

  .pack-size {
    font-size: 12px;
    color: #757575
  }

  .icon-viewed, .icon-premium {
    position: absolute;
    top: 5px;
  }

  .icon-viewed {
    left: 5px;
  }

  .icon-premium {
    right: 5px;
  }
}
</style>
