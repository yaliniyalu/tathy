<template>
  <q-card bordered flat>
    <q-card-section class="q-gutter-md flex justify-center">
      <q-btn :flat="!isSelected(status.name)" :unelevated="isSelected(status.name)"
             :color="status.color"
             :icon="status.icon"
             :label="status.name + ': ' + status.count"

             @click="filterByStatus(status.name)"

             v-for="status in filterStatus"
             :key="status.name" />
    </q-card-section>

    <q-separator/>

    <q-table
      grid
      title="Items"
      :rows="selectedItems"
      :columns="columns"
      row-key="name"
      :filter="filter"
      :pagination="pagination"
      hide-header
    >
      <template v-slot:top-right>
        <q-input dense debounce="300" v-model="filter" placeholder="Search" :model-value="filter">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
        <q-btn class="q-ml-md" color="primary" unelevated icon="add" label="New" @click="openAddDialog"/>
      </template>

      <template v-slot:item="props">
        <div class="col-xs-6 col-sm-4 col-md-3 q-pa-sm cursor-pointer" v-html="props.row.renderedSvg" @click="emit('selected', props.row._id)"/>
      </template>
    </q-table>
  </q-card>

</template>

<script setup>
import {useQuasar} from "quasar";
import {computed, ref} from "vue";

const columns = [
  { name: 'text', required: true, label: 'Text', field: 'text', sortable: true },
  { name: 'type', required: true, label: 'Type', field: 'type', sortable: true },
];

/** @type {Readonly<{items: Array}>} */
const props = defineProps({
  items: Array
});
const emit = defineEmits(['selected', 'add-new'])

const $q = useQuasar()

const filter = ref()
const pagination = ref({
  rowsPerPage: 25
})
const selected = ref('All')
/** @type {ComputedRef<[{color: string, name: string, icon: string, count: number}]>} */
const filterStatus = computed(() => [
  { name: 'All', color: 'info', icon: 'border_all', count: props.items.length },
  { name: 'Pending', color: 'warning', icon: 'schedule', count: props.items.reduce((a, v) => a + (v['status'] === 'Pending' ? 1 : 0 ), 0) },
  { name: 'Approved', color: 'positive', icon: 'check', count: props.items.reduce((a, v) => a + (v['status'] === 'Approved' ? 1 : 0 ), 0)  },
  { name: 'Rejected', color: 'negative', icon: 'warning', count: props.items.reduce((a, v) => a + (v['status'] === 'Rejected' ? 1 : 0 ), 0)  }

])

const selectedItems = computed(() => {
  if (selected.value === 'All') {
    return props.items;
  }

  return props.items.filter(v => v.status === selected.value)
})

function isSelected(status) {
  return selected.value === status
}

function filterByStatus(s) {
  selected.value = s
}

function openAddDialog() {
  emit('add-new')
}
</script>

<style lang="scss" scoped>

</style>
