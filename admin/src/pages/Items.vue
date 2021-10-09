<template>
  <q-page class="q-pa-md">
    <q-card bordered flat>
      <q-card-section class="q-gutter-md flex justify-center">
        <q-btn :flat="!isStatusSelected(status.name)" :unelevated="isStatusSelected(status.name)"
               :color="status.color"
               :icon="status.icon"
               :label="getStatusLabel(status.name)"

               @click="filterByStatus(status.name)"

               v-for="status in filterStatus"
               :key="status.name" />
      </q-card-section>

      <q-separator/>

      <q-table
        grid
        title="Items"
        :rows="rows"
        :columns="columns"
        row-key="_id"
        v-model:pagination="pagination"
        :filter="filter"
        hide-header

        :loading="loading"
        @request="onRequest"
        binary-state-sort

        ref="tableRef"
      >
        <template v-slot:top-right>
          <q-btn class="q-ml-md" color="primary" unelevated icon="add" label="New" @click="openAddDialog"/>
        </template>

        <template v-slot:item="props">
          <div class="col-xs-6 col-sm-4 col-md-3 q-pa-sm cursor-pointer" v-html="props.row.renderedSvg" @click="openItem(props.row._id)"/>
        </template>

        <template v-slot:no-data>
          <p class="q-ma-none text-center text-negative" style="width: 100%" v-if="loading">Loading</p>
          <p class="q-ma-none text-center" style="width: 100%" v-else-if="!error">No data matches your query.</p>
          <p class="q-ma-none text-center text-negative" style="width: 100%" v-else-if="error">Error while loading the data. Please try again.</p>
        </template>
      </q-table>
    </q-card>

    <q-drawer
      side="right"
      v-model="drawer"
      elevated
      :width="400"
      :breakpoint="500"
    >
      <q-toolbar style="position: fixed;z-index: 1;" class="bg-secondary text-white">
        <q-btn flat dense icon="add" label="Add Item" class="q-mr-sm" @click="openAddDialog" />
        <q-space/>
        <q-btn flat round dense icon="close" @click="drawer = false" />
      </q-toolbar>

      <q-scroll-area class="fit" style="padding-top: 50px">
        <ViewItem :item="selectedItem" v-if="selectedItem" @updated="refreshTable" @deleted="deleteItem"/>
      </q-scroll-area>
    </q-drawer>
  </q-page>
</template>

<script setup>
import {useQuasar} from "quasar";
import {computed, onMounted, reactive, ref} from "vue";
import {api} from "boot/axios";
import EditItemDialog from "components/EditItemDialog";
import ViewItem from "components/ViewItem";

const columns = [
  { name: 'text', required: true, label: 'Text', field: 'text', sortable: true },
  { name: 'type', required: true, label: 'Type', field: 'type', sortable: true },
];

const filterStatus = computed(() => [
  { name: 'All', color: 'info', icon: 'border_all' },
  { name: 'Pending', color: 'warning', icon: 'schedule' },
  { name: 'Approved', color: 'positive', icon: 'check' },
  { name: 'Rejected', color: 'negative', icon: 'warning' }
])

const $q = useQuasar()

const defaultPagination = {
  sortBy: 'createdAt',
  descending: true,
  page: 1,
  rowsPerPage: 28,
  rowsNumber: 30
}

const tableRef = ref()
const rows = ref([])
const filter = ref('')
const loading = ref(false)
const error = ref(false)
const totalRows = ref(0)
const pagination = ref({...defaultPagination})
const filteredCount = reactive({ All: null, Pending: null, Approved: null, Rejected: null })

onMounted(() => {
  onRequest({
    pagination: pagination.value,
    filter: undefined
  })
})

async function fetchFromServer(startRow, fetchCount, filter, sortBy, descending, status = undefined) {
    const res = await api.post("items/search", {
      skip: startRow,
      limit: fetchCount,
      q: filter ? filter : undefined,
      sort: {[sortBy]: descending ? -1 : 1},
      status: status,
      populate: []
    })

    return res.data.data.items
}

async function onRequest (props) {
  const { page, rowsPerPage, sortBy, descending } = props.pagination
  const filter = props.filter

  loading.value = true
  error.value = false

  const fetchCount = rowsPerPage === 0 ? pagination.value.rowsNumber : rowsPerPage
  const startRow = (page - 1) * rowsPerPage
  const status = selectedStatus.value === 'All' ? undefined : selectedStatus.value

  try {
    const {totalCount, results} = await fetchFromServer(startRow, fetchCount, filter, sortBy, descending, status)
    rows.value.splice(0, rows.value.length, ...results)

    if (!status) {
      totalRows.value = totalCount
    }

    filteredCount[selectedStatus.value] = totalCount
  } catch (e) {
    rows.value.splice(0, rows.value.length)
    error.value = true
  }

  pagination.value.rowsNumber = totalRows.value
  pagination.value.page = page
  pagination.value.rowsPerPage = rowsPerPage
  pagination.value.sortBy = sortBy
  pagination.value.descending = descending

  loading.value = false
}

function refreshTable() {
  tableRef.value.requestServerInteraction()
}

function resetTable() {
  pagination.value = {...defaultPagination}
  tableRef.value.requestServerInteraction()
}

const selectedItem = ref()
const selectedStatus = ref('All')
const drawer = computed({
  get() {
    return !!selectedItem.value
  },
  set() {
    selectedItem.value = null
  }
})

function openAddDialog() {
  $q.dialog({
    component: EditItemDialog,
    componentProps: {},
    persistent: true
  }).onOk(_ => {
    refreshTable()
  })
}

async function openItem(id) {
  selectedItem.value = rows.value.find(v => v._id === id)
}

function deleteItem() {
  selectedItem.value = null
  refreshTable()
}

function isStatusSelected(status) {
  return selectedStatus.value === status
}

function getStatusLabel(name) {
  if (filteredCount[name] !== null) {
    return name + " : " + filteredCount[name]
  }
  return name
}

function filterByStatus(s) {
  selectedStatus.value = s
  resetTable()
}
</script>

<style scoped>

</style>
