<template>
  <q-page class="q-pa-md q-gutter-md">
    <q-card v-if="pack">
            <q-card-section>
              <div class="row q-col-gutter-md">
                <div class="col-auto">
                  <ImagePreview style="width: 200px" :src="getAssetUrl(pack.image, 'packs')" layout="rounded" :readonly="true"/>
                </div>
                <div class="col">
                  <p class="text-h5">{{ pack.name }}</p>
                  <p>{{ pack.description }}</p>
                  <p class="q-gutter-md">
                    <q-badge color="secondary" :label="tag" v-for="tag in pack.tags"/>
                  </p>
                </div>
              </div>
            </q-card-section>
            <q-separator/>
            <q-card-actions>
              <q-btn-dropdown flat :model-value="false" :color="status.color" :icon="status.icon" :label="status.name" :loading="updatingStatus">
                <q-list>
                  <q-item :class="'text-' + status.color" clickable v-close-popup v-for="status in statuses" @click="promptChangeStatus(status)">
                    <q-item-section avatar>
                      <q-icon :name="status.icon"/>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ status.name }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
              <q-space/>
              <q-btn label="Edit" icon="edit" flat color="primary" @click="editPackInfo"/>
            </q-card-actions>
          </q-card>

    <q-table
      title="In-App Purchase"
      :rows="[ pack.purchase ]"
      :columns="[{ label: 'Amount', name: 'amount', field: 'amount', align: 'center' }, { label: 'SKU', name: 'sku', field: 'sku', align: 'center' }]"
      row-key="name"
      v-if="pack"
    >
      <template v-slot:body-cell-amount="props">
        <q-td class="flex flex-center justify-center">
          <q-badge :label="formatPrice(props.row)" :color="getPriceColor(props.row)"/>

          <q-popup-edit buttons persistent v-slot="scope"
                        @save="changePurchase"
                        v-model="packAmount" :model-value="packAmount"
                        :validate="(v) => isAmountValid(v)">
            <q-input outlined stack-label label="Amount" v-model="scope.value" :model-value="scope.value" @keyup.enter="scope.set" dense autofocus
                     :error="!isAmountValid(scope.value)"
                     error-message="Enter amount"
            >
              <template v-slot:prepend>
                <q-icon name="attach_money" />
              </template>
            </q-input>
          </q-popup-edit>
        </q-td>
      </template>

      <template v-slot:bottom="props">
        <div class="col text-center">Click on the amount to change.</div>
      </template>

    </q-table>

    <q-drawer
      side="right"
      v-model="drawer"
      elevated
      :width="400"
      :breakpoint="500"
      v-if="pack"
    >
      <q-toolbar style="position: fixed;z-index: 1;" class="bg-secondary text-white" v-if="drawerContent === 'item'">
        <q-btn flat dense icon="add" label="Add Item" class="q-mr-sm" @click="showAddItemDialog" />
        <q-space/>
        <div class="q-gutter-sm flex items-center" v-if="selectedItem">
          <q-btn icon="chevron_left" round flat @click="viewPrevItem" :disable="selectedItemIndex === 0"/>
          <span>{{ selectedItemIndex + 1 }}/{{ pack.items.length }}</span>
          <q-btn icon="chevron_right" round flat @click="viewNextItem" :disable="selectedItemIndex === (pack.items.length - 1)"/>
        </div>
        <q-space/>
        <q-btn flat round dense icon="close" @click="closeDrawer" />
      </q-toolbar>

      <q-toolbar style="position: fixed;z-index: 1;" class="bg-secondary text-white" v-if="drawerContent === 'pack-edit'">
        <div class="text-bold">Pack Edit</div>
        <q-space/>
        <q-btn flat round dense icon="close" @click="closeDrawer"/>
      </q-toolbar>

      <q-scroll-area class="fit" style="padding-top: 50px">
        <ViewItem :item="selectedItem" v-if="selectedItem && drawerContent === 'item'" @updated="updateItem" @deleted="deleteItem"/>
        <EditPack :pack="pack" v-if="drawerContent === 'pack-edit'" @updated="updatePack"/>
      </q-scroll-area>
    </q-drawer>

    <ListItems :items="pack.items" @selected="viewItem" @addNew="showAddItemDialog" v-if="pack"/>
  </q-page>
</template>

<script setup>

import {useRoute} from "vue-router";
import {computed, onMounted, ref, watch} from "vue";
import http from "src/http";
import ImagePreview from "components/ImagePreview";
import EditItemDialog from "components/EditItemDialog";
import {getAssetUrl} from 'src/utils';
import {useQuasar} from "quasar";
import ListItems from "components/pack/ListItems";
import ViewItem from "components/pack/ViewItem";
import EditPack from "components/pack/EditPack";
import ui from "src/ui";

const statuses = [
  { name: 'Enabled', color: 'positive', icon: 'check', prompt: 'Do you want to enable the pack', promptButton: 'Enable' },
  { name: 'Disabled', color: 'negative', icon: 'warning', prompt: 'Do you want to disable the pack', promptButton: 'Disable' }
]

const route = useRoute()
const $q = useQuasar()

const id = route.params.id

/** @type {Ref<{name: string, description: string, image: string, tags: Array, purchase: { amount: Number, sku: string }, items: Array}>}}*/
const pack = ref(null)

const packImage = ref("")
const packAmount = ref(null)
const status = ref(statuses[1])
const updatingStatus = ref(false)

const loading = ref(false)

onMounted(async () => {
  const populate = [
    'createdBy(id, name, role, image, email)',
    'updatedBy(id, name, role, image, email)',
    'items()',
    'category()'
  ]

  const res = await http.get('pack/' + id, {
    params: { populate: populate.join(',') }
  })

  setPack(res.data.data.pack)
})

watch(pack, () => {
  status.value = statuses.find(v => v.name === pack.value.status)
})

function promptChangeStatus(s) {
  if (s.name === status.value.name) {
    return
  }

  $q.dialog({
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
    updateStatus({ status: s.name })
  })
}

async function updateStatus(data) {
  updatingStatus.value = true

  try {
    const res = await http.patch('pack/' + pack.value._id + "/status", data)
    pack.value.status = res.data.data.pack.status
    status.value = statuses.find(v => v.name === pack.value.status)

    ui.notifySuccess("Status updated successfully")
  } catch (e) {
    ui.notifyError(e.response.data.message)
  } finally {
    updatingStatus.value = false
  }
}

function setPack(data) {
  pack.value = data
  packAmount.value = data.purchase.amount
}

function updatePack(p) {
  pack.value.name = p.name
  pack.value.description = p.description
  pack.value.image = p.image
  pack.value.tags = p.tags

  closeDrawer()
}

function editPackInfo() {
  openDrawer('pack-edit')
}

function formatPrice(row) {
  return row.amount === 0 ? 'Free' : `$${row.amount.toFixed(2)}`
}

function getPriceColor(row) {
  return row.amount === 0 ? 'green' : 'red'
}

function changePurchase(e) {
  pack.value.purchase.amount = parseFloat(e)
}

function isAmountValid(n) {
  return !isNaN(parseFloat(n)) && isFinite(n) && n >= 0;
}

function showAddItemDialog() {
  $q.dialog({
    component: EditItemDialog,
    componentProps: {
      pack: id
    },
    persistent: true
  }).onOk(item => {
    addItem(item)
  })
}


const drawerContent = ref(null)
const drawer = computed({
  get() {
    return drawerContent.value !== null
  },
  set() {
    // closeDrawer()
  }
})

function openDrawer(drawerType) {
  drawerContent.value = drawerType
}

function closeDrawer() {
  drawerContent.value = null
  selectedItem.value = null
}

const selectedItem = ref(null)
watch(selectedItem, () => selectedItem.value ? openDrawer('item') : closeDrawer())


const selectedItemIndex = computed(() => {
    return selectedItem.value && pack.value.items.findIndex(v => v._id === selectedItem.value._id)
})

function viewItem(id) {
  selectedItem.value = pack.value.items.find(v => v._id === id)
}

function viewNextItem() {
  if (pack.value.items[selectedItemIndex.value + 1]) {
    viewItem(pack.value.items[selectedItemIndex.value + 1]._id)
  }
}

function viewPrevItem() {
  if (pack.value.items[selectedItemIndex.value - 1]) {
    viewItem(pack.value.items[selectedItemIndex.value - 1]._id)
  }
}

function updateItem(item) {
  const index = pack.value.items.findIndex(v => v._id === item._id)
  pack.value.items[index] = item
}

function deleteItem(item) {
  const index = pack.value.items.findIndex(v => v._id === item._id)
  if (index > -1) {
    pack.value.items.splice(index, 1);
  }
}

function addItem(item) {
  pack.value.items.push(item)
  viewItem(item._id)
}

</script>

<style lang="scss" scoped>

</style>
