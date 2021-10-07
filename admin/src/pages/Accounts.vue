<template>
  <q-page class="q-pa-md">
    <q-table
      grid
      grid-header
      title="Users"
      :rows="rows"
      :columns="columns"
      row-key="_id"
      :filter="filter"
      hide-header
      :visible-columns="['name', 'email', 'role']"
    >
      <template v-slot:top-right>
        <q-input borderless dense debounce="300" v-model="filter" :model-value="filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>

      <template v-slot:item="props">
        <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4">
          <q-card class="cursor-pointer" @click="openUser(props['row'])">
            <q-card-section class="text-center">
              <div class="row no-wrap">
                <div class="column items-center">
                  <q-avatar size="72px">
                    <img :src="getAvatarUrl(props['row'])" alt="user">
                  </q-avatar>
                </div>

                <div class="column q-ml-md text-left">
                  <strong>{{ props['row']['name'] }}</strong>
                  <span>{{ props['row']['email'] }}</span>
                  <div>
                    <q-badge color="primary">{{ props['row']['role'] }}</q-badge>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </template>
    </q-table>
  </q-page>
</template>

<script setup>
import {onMounted, ref} from "vue";
import http from "src/http";

import {getAvatarUrl} from "src/utils";
import {useRouter} from "vue-router";

const columns = [
  { name: 'id', required: true, label: 'Id', field: '_id', sortable: false},
  { name: 'name', required: true, label: 'Name', field: 'name', sortable: true },
  { name: 'email', required: true, label: 'Email', field: 'email', sortable: true },
  { name: 'role', required: true, label: 'Role', field: 'role', sortable: true },
]

const rows = ref([])
const filter = ref('')
const loading = ref(false)

const router = useRouter()

async function loadUsers() {
  loading.value = true
  try {
    const res = await http.get("/user")
    rows.value = res.data.data['users']
  } catch (e) {

  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadUsers()
})

function openUser(user) {
  router.push('/accounts/' + user._id)
}
</script>

<style lang="scss" scoped>

</style>
