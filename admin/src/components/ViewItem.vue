<template>
<div class="q-pa-sm bg-grey-3">
  <div v-html="data.renderedSvg"/>

  <div class="q-gutter-md q-mt-sm flex justify-around">
    <q-btn unelevated color="secondary" icon="edit" label="Edit" @click="editItem"/>
    <q-btn flat color="negative" icon="delete" label="Delete" @click="promptDelete"/>
  </div>

  <q-separator class="q-mt-sm"/>

  <div class="q-gutter-md q-mt-md">
    <div class="text-center">
      <q-btn-dropdown unelevated :model-value="false" :color="status.color" :icon="status.icon" :label="status.name" :loading="updatingStatus">
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
    </div>

    <UserActionCard v-if="!loading" :user="data.statusChangedBy" :action="data.status" :date="data.statusChangedAt"/>

    <q-card flat bordered v-if="data.rejectedReason">
      <q-card-section>
        <div><strong>Rejected Reason</strong></div>
        <span class="text-grey-8">{{ data.rejectedReason }}</span>
      </q-card-section>
    </q-card>
  </div>

  <q-separator class="q-mt-sm"/>

  <div class="q-gutter-md q-mt-md" v-if="!loading">
      <UserActionCard :user="data.createdBy" action="Created" :date="data.createdAt"/>
      <UserActionCard :user="data.updatedBy" action="Updated" :date="data.updatedAt"/>
  </div>
</div>
</template>

<script setup>
import UserActionCard from "components/UserActionCard";
import {onMounted, ref, watch, defineProps, defineEmits} from "vue";
import http from "src/http";
import {useQuasar} from "quasar";
import EditItemDialog from "components/EditItemDialog";
import ui from "src/ui";

const props = defineProps({
  item: Object
});
const emit = defineEmits(['updated', 'deleted'])

const statuses = [
  { name: 'Pending', color: 'warning', icon: 'schedule', prompt: 'Do you want to put item in pending', promptButton: 'Yes' },
  { name: 'Approved', color: 'positive', icon: 'check', prompt: 'Do you want to approve the item', promptButton: 'Approve' },
  { name: 'Rejected', color: 'negative', icon: 'warning', prompt: 'Do you want to reject the item', promptButton: 'Reject' }
]

const quasar = useQuasar()

const status = ref(statuses[1])

/** @type {Ref<{
 * renderedSvg: string,
 * status: string,
 * createdBy: Object, updatedBy: Object,
 * createdAt: string, updatedAt: string,
 * statusChangedBy: {}, statusChangedAt: string,
 * rejectedReason
 * }>}*/
const data = ref(props.item)
const loading = ref(true)

onMounted(async () => {
  await loadUser()
})

async function loadUser() {
  loading.value = true

  const populate = [
    'createdBy(id, name, role, image, email)',
    'updatedBy(id, name, role, image, email)',
    'statusChangedBy(id, name, role, image, email)'
  ]

  const res = await http.get('item/' + props.item._id, {
    params: { populate: populate.join(',') }
  })

  data.value = res.data.data.item
  loading.value = false
}

watch(data, () => status.value = statuses.find(v => v.name === data.value.status))
watch(() => props.item, () => {
  data.value = props.item
  loadUser()
})


function promptChangeStatus(s) {
  if (s.name === status.value.name) {
    return
  }

  if (s.name === 'Rejected') {
    quasar.dialog({
      message: 'Reason for rejecting the item?',
      prompt: {
        model: '',
        type: 'textarea',
        outlined: true,
        stackLabel: true,
        autoGrow: true,
        label: "Reason"
      },
      cancel: true,
      persistent: true,
      ok: {
        unelevated: true,
        color: s.color,
        label: s.promptButton
      }
    }).onOk(reason => {
      updateStatus({ status: s.name, reason })
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
    updateStatus({ status: s.name })
  })
}

function promptDelete() {
  quasar.dialog({
    title: 'Confirm',
    message: "Do you want to delete the item?",
    persistent: true,
    ok: {
      unelevated: true,
      color: 'negative',
      label: 'Delete'
    },
    cancel: true
  }).onOk(() => {
    deleteItem()
  })
}

const updatingStatus = ref(false)
const deletingItem = ref(false)

async function updateStatus(req) {
  updatingStatus.value = true
  try {
    const res = await http.patch(`item/${data.value._id}/status`, req)
    await loadUser()
    emit('updated', res.data.data.item)
  } catch (e) {
    ui.notifyError(e.response.data.message)
  } finally {
    updatingStatus.value = false
  }
}

async function deleteItem() {
  deletingItem.value = true
  try {
    await http.delete(`item/${data.value._id}`)
    emit('deleted', data.value)
  } catch (e) {
    ui.notifyError(e.response.data.message)
  } finally {
    deletingItem.value = false
  }
}

function editItem() {
  quasar.dialog({
    component: EditItemDialog,
    componentProps: {
      item: data.value
    },
    persistent: true
  }).onOk(item => {
    loadUser()
    emit('updated', item)
  })
}



</script>

<style lang="scss" scoped>

</style>
