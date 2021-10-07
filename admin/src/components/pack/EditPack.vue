<template>
  <div class="q-pa-sm q-gutter-md bg-white">
    <div class="flex" style="justify-content: center">
      <ImagePreview style="width: 250px" :src="packImage" layout="rounded" :readonly="false" @change="onImageChange"/>
    </div>
    <q-input outlined stack-label label="Name" autofocus :model-value="data.name" v-model.lazy="data.name"/>
    <q-input input-style="min-height: 100px" rows="10" outlined stack-label label="Description" autogrow type="textarea" :model-value="data.description" v-model="data.description"/>
    <q-select outlined stack-label label="Category" :model-value="data.category" v-model="data.category"
              use-input :options="categories" map-options option-value="_id" option-label="name"
    />
    <q-select outlined stack-label label="Tags" :model-value="data.tags" v-model="data.tags"
              new-value-mode="add-unique" use-input use-chips multiple :options="tagsSearch"
    />

    <div class="text-center">
      <q-btn label="Update" icon="save" unelevated color="primary" @click="patchPack" :loading="loading"/>
    </div>
  </div>
</template>

<script setup>
import {defineEmits, defineProps, onMounted, ref} from "vue";
import http from "src/http";
import ui from "src/ui";
import {getAssetUrl} from "src/utils";
import ImagePreview from "components/ImagePreview";
import {extend} from "quasar";

const props = defineProps({
  pack: Object
});
const emit = defineEmits(['updated'])

/** @type {Ref<{name: string, description: string, category: string, image: string, tags: Array, purchase: { amount: Number, sku: string }}>}}*/
const data = ref(extend({}, props.pack))
const loading = ref(false)
const tagsSearch = ref([]);
const categories = ref([])
const packImage = ref(getAssetUrl(props.pack.image, 'packs'))

onMounted(async () => {
  const { data } = await http.get('tags')
  const res = await http.get('category')
  tagsSearch.value = data.data.tags.map(v => v.tag)
  categories.value = res.data.data.category
})

function onImageChange(file) {
  data.value.image = file.filename
  packImage.value = getAssetUrl(file.filename, 'temp')
}

async function patchPack() {
  loading.value = true

  try {
    const res = await http.patch('pack/' + data.value._id, {...data.value, category: data.value.category._id})
    ui.notifySuccess("Pack updated successfully")
    emit('updated', res.data.data.pack)
  } catch (e) {
    ui.notifyError(e.response.data.message)
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>

</style>
