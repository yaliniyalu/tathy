<template>
  <q-dialog
    ref="dialogRef" @hide="onDialogHide"
    persistent
    maximized
    transition-show="jump-up"
    transition-hide="jump-down"
  >
    <q-card>
      <q-card-section>
        <q-input type="search" outlined stack-label rounded dense autofocus
                 v-model="query" :model-value="query"
                 color="primary"
                 placeholder="What are you looking for?"
                  @keydown.enter="search(query)">

          <template v-slot:append>
            <q-icon color="primary" name="search" />
          </template>
          <template v-slot:prepend>
            <q-btn color="primary" dense icon="arrow_back" round flat v-close-popup />
          </template>
        </q-input>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-list dense padding class="q-pt-none">
          <q-item clickable v-for="s in suggestions" @click="openPackDetails(s)">
            <q-item-section><span v-html="highlightWord(s.name, query)"></span></q-item-section>
          </q-item>

          <p v-if="!suggestions" class="text-center text-grey">No suggestions</p>
        </q-list>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import {throttle, useDialogPluginComponent} from 'quasar'
import {ref, watch} from "vue";
import {api} from "boot/axios";
import {useRouter} from "vue-router";

const emits = defineEmits(useDialogPluginComponent.emits)

const { dialogRef, onDialogHide } = useDialogPluginComponent()
const router = useRouter()

const query = ref()
const suggestions = ref()

watch(query, _ => throttlesSuggestions())

const throttlesSuggestions = throttle(searchSuggestions, 600)

async function searchSuggestions() {
  if (query.value.length <= 0) {
    return
  }

  const {data: {data}} = await api.get('packs/search/suggestions', {params: { q: query.value }})
  suggestions.value = data.suggestions
}

function search(q) {
  onDialogHide()
  router.push(`/packs/search?q=${q}`)
}

function openPackDetails(p) {
  onDialogHide()
  router.push(`/pack/${p._id}`)
}

function highlightWord(word, search) {
  return word.replace(new RegExp(search, "ig"), `<span class="text-bold">${search}</span>`);
}
</script>

<style lang="scss" scoped>

</style>
