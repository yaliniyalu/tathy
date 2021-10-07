<template>
  <q-page class="q-pa-md">
    <q-card class="q-mt-md">
      <q-card-section class="q-gutter-x-md flex justify-center">
        <q-btn :flat="!isSelected(status.name)" :unelevated="isSelected(status.name)"
               :color="status.color"
               :icon="status.icon"
               :label="status.name + ': ' + status.count"

               @click="filterByStatus(status.name)"

               v-for="status in filterStatus"
               :key="status.name" />
      </q-card-section>

      <q-separator/>

      <q-card-section>
    <q-table
      title="Reports"
      :rows="selectedReports"
      :columns="columns"
      :filter="filter"
      row-key="_id"
      :pagination="pagination"
      selection="single"
      v-model:expanded="expanded"
      :visible-columns="visibleColumns"
      ref="tableRef"
      flat
    >
      <template v-slot:top-right>
        <q-input dense debounce="300" v-model="filter" placeholder="Search" :model-value="filter">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>

      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th auto-width />
          <q-th v-for="col in props.cols" :key="col.name" :props="props">
            {{ col.label }}
          </q-th>
        </q-tr>
      </template>

      <template v-slot:body="props">
        <q-tr class="cursor-pointer" :props="props" @click="expandRow(props.row)">
          <q-td auto-width>
            <q-checkbox :model-value="props.expand" :val="true" size="sm" color="primary" dense @click="expandRow(props.row)"/>
          </q-td>
          <template v-for="col in props.cols" :key="col.name">
            <q-td auto-width :props="props">
              <span v-if="col.name !== 'status'">{{ col.value }}</span>
              <span v-else-if="col.name === 'name'">{{ col.value.substring(0, 100) }}{{ col.value.length > 100 ? '...' : '' }}</span>
              <q-badge v-else :color="getStatusColor(col.value)" :label="col.value"/>
            </q-td>
          </template>
        </q-tr>
        <q-tr v-if="props.expand" :props="props">
          <q-td colspan="100%">
            <div class="row q-col-gutter-md">
              <div class="col-md-6">
                <div class="text-left">{{ props.row.report }}.</div>
                <div class="q-mt-md" v-if="props.row.actionTaken">
                  <div class="text-left text-bold">Action Taken</div>
                  <div class="text-left">{{ props.row.actionTaken }}.</div>
                </div>
              </div>

              <div class="col-md-6 q-gutter-md">
                <q-input v-model="props.row.notes" :model-value="props.row.notes" autogrow outlined stack-label label="Notes" :loading="updatingNotes">
                  <template v-slot:append>
                    <q-btn flat round color="primary" icon="save" @click="updateNotes(props.row.notes, props.row._id)" v-if="!updatingNotes">
                      <q-tooltip  :offset="[10, 10]">Save Notes</q-tooltip>
                    </q-btn>
                  </template>
                </q-input>
                <q-btn-dropdown unelevated :model-value="false"
                                :color="getStatusValue(props.row.status, 'color')"
                                :icon="getStatusValue(props.row.status, 'icon')"
                                :label="getStatusValue(props.row.status, 'name')"
                                :loading="updatingStatus">
                  <q-list>
                    <q-item :class="'text-' + status.color" clickable v-close-popup v-for="status in statuses" @click="promptChangeStatus(status, props.row)">
                      <q-item-section avatar>
                        <q-icon :name="status.icon"/>
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ status.name }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-btn-dropdown>
                <q-btn color="primary" flat icon="image" label="View Item" @click="viewItem(props.row)" :loading="openingDrawer" v-if="!drawer"/>
                <q-btn color="primary" flat icon="image" label="Close Item" @click="closeDrawer" :loading="openingDrawer" v-if="drawer"/>
              </div>
            </div>
          </q-td>
        </q-tr>
      </template>
    </q-table>
      </q-card-section>
    </q-card>

    <q-drawer
      side="right"
      v-model="drawer"
      elevated
      :width="400"
      :breakpoint="500"
    >
      <q-toolbar style="position: fixed;z-index: 1;" class="bg-secondary text-white">
        <div class="text-h6">Reported Item</div>
        <q-space/>
        <q-btn flat round dense icon="close" @click="drawer = false" />
      </q-toolbar>

      <q-scroll-area class="fit" style="padding-top: 50px">
        <ViewItem :item="selectedItem" v-if="selectedItem"/>
      </q-scroll-area>
    </q-drawer>
  </q-page>
</template>

<script setup>
import {date, useQuasar} from "quasar";
import {useRouter} from "vue-router";
import {computed, onMounted, ref, watch} from "vue";
import http from "src/http";

import ViewItem from "components/pack/ViewItem";
import ui from "src/ui";

const columns = [
  { name: 'id', label: 'Id', field: '_id', sortable: false},
  { name: 'report', label: 'Report', field: 'report', sortable: true, align: 'left' },
  { name: 'status', label: 'Status', field: 'status', sortable: true },
  { name: 'date', label: 'Date', field: 'createdAt', sortable: true, format: v => date.formatDate(new Date(v), 'DD-MM-YYYY h:m a') },
];

const statuses = [
  { name: 'Pending', color: 'warning', icon: 'schedule', prompt: 'Do you want to put report in pending', promptButton: 'Yes' },
  { name: 'Resolved', color: 'positive', icon: 'check', prompt: 'Do you want to resolve the report', promptButton: 'Resolve' },
  { name: 'Rejected', color: 'negative', icon: 'warning', prompt: 'Do you want to reject the report', promptButton: 'Reject' }
]

const quasar = useQuasar()
const router = useRouter()

const reports = ref([])
const filter = ref()
const addDialog = ref(false)
const pagination = ref({
  rowsPerPage: 20
})
const visibleColumns = ref(['report', 'status', 'date'])
const tableRef = ref()

const expanded = ref([])
const drawer = ref(false)

const openingDrawer = ref(false)
const updatingStatus = ref(false)
const updatingNotes = ref(false)
const selectedItem = ref(null)

onMounted(async () => {
  const {data} = await http.get('/reports')
  reports.value = data.data['reports']
})

function expandRow(row) {
  if (expanded.value.length && expanded.value[0] === row['_id']) {
    expanded.value = []
  } else {
    expanded.value = [row['_id']]
  }
}

watch(expanded, () => {
  if (expanded.value.length && drawer.value) {
    viewItem(reports.value.find(v => v._id === expanded.value[0]))
  } else {
    closeDrawer()
  }
})

function getStatusColor(status) {
  switch (status) {
    case 'Pending': return 'warning'
    case 'Resolved': return 'positive'
    case 'Rejected': return 'danger'
    default: return 'info'
  }
}

function getStatusValue(status, key) {
  return statuses.find(v => v.name === status)[key]
}

function closeDrawer() {
  selectedItem.value = null;
  drawer.value = false
}

async function viewItem(row) {
  selectedItem.value = null;
  openingDrawer.value = true
  try {
    const res = await http.get('/item/' + row.item)
    selectedItem.value = res.data.data.item
    drawer.value = true
  } catch (e) {
    ui.notifyError(e.response.data.message)
  } finally {
    openingDrawer.value = false
  }
}

function promptChangeStatus(s, row) {
  if (s.name === row.status) {
    return
  }

  if (s.name !== 'Pending') {
    quasar.dialog({
      message: 'Action Taken or Reason?',
      prompt: {
        model: row.actionTaken,
        type: 'textarea',
        outlined: true,
        stackLabel: true,
        autoGrow: true,
        label: "Action Taken"
      },
      cancel: true,
      persistent: true,
      ok: {
        unelevated: true,
        color: s.color,
        label: s.promptButton
      }
    }).onOk(actionTaken => {
      updateStatus({ status: s.name, actionTaken }, row._id)
    })
    return;
  }

  quasar.dialog({
    title: 'Confirm',
    message: s.prompt,
    persistent: true,
    ok: {
      unelevated: true,
      color: s.color,
      label: s.promptButton
    },
    cancel: {
      flat: true
    },
  }).onOk(() => {
    updateStatus({ status: s.name }, row._id)
  })
}

async function updateStatus(req, id) {
  updatingStatus.value = true
  try {
    const res = await http.patch(`report/${id}/status`, req)
    const index = reports.value.findIndex(v => v._id === id);
    reports.value.splice(index, 1, res.data.data.report)
  } catch (e) {
    ui.notifyError(e.response.data.message)
  } finally {
    updatingStatus.value = false
  }
}

async function updateNotes(notes, id) {
  if (!notes) return

  updatingNotes.value = true
  try {
    const res = await http.patch(`report/${id}/notes`, { notes })
    const index = reports.value.findIndex(v => v._id === id);
    reports.value.splice(index, 1, res.data.data.report)
  } catch (e) {
    ui.notifyError(e.response.data.message)
  } finally {
    updatingNotes.value = false
    ui.notifySuccess("Notes Updated")
  }
}

const selected = ref('All')
/** @type {ComputedRef<[{color: string, name: string, icon: string, count: number}]>} */
const filterStatus = computed(() => {
  const arr = statuses.map(status => {
    return {
      ...status,
      count: reports.value.reduce((a, v) => a + (v['status'] === status.name ? 1 : 0 ), 0)
    }
  })

  arr.unshift({ name: 'All', color: 'info', icon: 'border_all', count: reports.value.length })
  return arr
})

const selectedReports = computed(() => {
  if (selected.value === 'All') {
    return reports.value;
  }

  return reports.value.filter(v => v.status === selected.value)
})

function isSelected(status) {
  return selected.value === status
}

function filterByStatus(s) {
  selected.value = s
}

</script>

<style lang="scss" scoped>

</style>
