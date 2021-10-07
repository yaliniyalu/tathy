<template>
  <q-dialog ref="dialogRef">
    <q-card style="width: 700px; max-width: 80vw;">
      <q-card-section>
        <strong>Add Pack</strong>
      </q-card-section>
      <q-separator/>
      <q-card-section>
        <div class="row">
          <div class="col-8 q-gutter-md">
            <q-input outlined stack-label label="Name" autofocus :model-value="name" v-model="name"/>
            <q-input outlined stack-label label="Description" autogrow :model-value="description" v-model="description"/>
            <q-select outlined stack-label label="Category" :model-value="category" v-model="category"
                      use-input :options="categories" map-options emit-value option-value="_id" option-label="name"
            />
            <q-select outlined stack-label label="Tags" :model-value="tags" v-model="tags"
                      new-value-mode="add-unique" use-input use-chips multiple :options="tagsSearch"
            />
          </div>
          <div class="col-4 flex justify-center flex-center q-pl-md">
            <ImagePreview :src="image && getAssetUrl(image, 'temp')" layout="rounded" @change="onImageChange"/>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn color="primary" flat label="Cancel" v-close-popup/>
        <q-btn color="primary" unelevated label="Create Pack" :disable="!(name && image)" :loading="loading" @click="savePack" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import {useDialogPluginComponent, useQuasar} from "quasar";
import {onMounted, ref} from "vue";
import {getAssetUrl} from 'src/utils';
import http from "src/http";
import ui from "src/ui";
import ImagePreview from "components/ImagePreview";

const { dialogRef, onDialogOK } = useDialogPluginComponent()

const $q = useQuasar()

const name = ref()
const description = ref()
const tags = ref([])
const image = ref(null)
const category = ref()

const tagsSearch = ref([]);
const categories = ref([]);
const loading = ref(false)

onMounted(async () => {
  const { data } = await http.get('tags')
  tagsSearch.value = data.data.tags.map(v => v.tag)
  const res = await http.get('category')
  categories.value = res.data.data.category
})

function onImageChange(file) {
  image.value = file.filename
}

async function savePack() {
  loading.value = true

  try {
    const res = await http.post('pack', {
      name: name.value,
      description: description.value,
      tags: tags.value,
      image: image.value,
      category: category.value,
      purchase: { amount: 0 }
    })
    ui.notifySuccess("Pack saved successfully")
    onDialogOK(res.data.data.pack)
  } catch (e) {
    ui.notifyError(e.response.data.message)
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>

</style>
