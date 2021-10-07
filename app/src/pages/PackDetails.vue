<template>
  <q-page class="q-pa-md bg-white">
    <AppHeader/>

    <div class="pack-details-header" v-if="pack">
      <div class="info">
        <div class="info-container">
          <h5 class="title">{{ pack.name }}</h5>
          <q-badge color="secondary" :label="pack.category.name"/>
          <q-badge color="primary" class="q-ml-md" :label="pack.itemsCount + ' facts'"/>
<!--          <q-badge color="primary" class="q-ml-md" :label="pack.purchase + ' facts'"/>-->
        </div>
        <div class="image-container">
          <img class="image" :src="getAssetsUrl(pack.image, 'packs')" :alt="pack.name">
        </div>
      </div>

      <q-separator class="q-mt-md"/>

      <div class="q-mt-md" v-if="pack.description">
        <b class="text-primary">Description</b>
        <p>{{ pack.description }}</p>
      </div>

      <div v-if="pack.tags?.length">
        <q-badge color="info" class="q-mr-md" :label="tag" v-for="tag in pack.tags"/>
      </div>

      <q-separator class="q-mt-md"/>

      <div class="flex justify-center flex-center q-mt-xl q-mb-xl">
        <q-btn unelevated color="positive" label="Continue Learning" @click="startLearning" v-if="completedIndex"/>
        <q-btn unelevated color="positive" label="Start Learning" @click="startLearning" v-else/>
<!--        <q-btn unelevated color="positive" label="Buy Now"/>-->
      </div>

      <q-separator class="q-mt-md"/>

      <div class="q-mt-md" v-if="relatedTopics">
        <PacksSwiper :packs="relatedTopics" title="Related Topics"/>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import {onMounted, ref} from 'vue';
import {useRoute, useRouter} from "vue-router";
import {getAssetsUrl} from "src/utils";
import PackCard from "components/PackCard";
import {api} from "boot/axios";
import AppHeader from "components/AppHeader";
import {useQuasar} from "quasar";
import PacksSwiper from "components/PacksSwiper";

const route = useRoute()
const router = useRouter()
const quasar = useQuasar()

const id = route.params.id

const pack = ref()
const relatedTopics = ref()
const completedIndex = ref(false)

onMounted(async () => {
  // quasar.loading.show()
  const res = await api.get('/pack/' + id);
  pack.value = res.data.data.pack
  quasar.loading.hide()

  const res2 = await api.get(`/pack/${id}/related`)
  relatedTopics.value = res2.data.data.packs
})

function startLearning() {
  router.push(`/pack/${id}/gallery?from=${completedIndex.value}`)
}

</script>

<style lang="scss">
.pack-details-header {
  .info {
    display: flex;
  }

  .info-container {
    flex: 1;

    .title {
      margin: 0;
      color: var(--q-primary);

      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      max-height: 64px;
    }

    .items-count {
      //color: var(--q-secondary);
    }
  }

  .image-container {
    height: 53px;

    .image {
      height: 100%;
      border-radius: 10px;
    }
  }
}
</style>
