<template>
  <q-page class="q-pa-md">
    <q-table
      grid
      title="Packs"
      :rows="rows"
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
        <div class="col-xs-6 col-sm-4 col-md-3 q-pa-sm">
          <div class="pack-card" @click="openPackDetails(props.row._id)">
            <div class="img-wrapper">
              <img :src="getAssetUrl(props.row.image, 'packs')" :alt="props.row.name">
              <span :class="['price', getPriceColor(props.row)]">{{ formatPrice(props.row) }}</span>
              <span class="count">{{ props.row.itemsCount ?? 0 }} items</span>
            </div>
            <div class="info-wrapper">
              <div class="name">
                {{ props.row.name }}
              </div>
              <div class="description">
                {{ props.row.description }}
              </div>
            </div>
          </div>
        </div>
      </template>
    </q-table>
  </q-page>
</template>

<script setup>
import {onMounted, ref} from "vue";
import http from "src/http";
import {getAssetUrl} from 'src/utils';
import {useQuasar} from "quasar";
import AddPackDialog from "components/AddPackDialog";
import {useRouter} from "vue-router";

const columns = [
  { name: 'id', required: true, label: 'Id', field: '_id', sortable: false},
  { name: 'name', required: true, label: 'Name', field: 'name', sortable: true },
  { name: 'itemCount', required: true, label: 'Item Count', field: 'itemCount', sortable: true },
];

const $q = useQuasar()
const router = useRouter()

const rows = ref([])
const filter = ref()
const addDialog = ref(false)
const pagination = ref({
  rowsPerPage: 20
})

onMounted(async () => {
  const res = await http.get('pack')
  rows.value = res.data.data['packs']
})

function formatPrice(row) {
  return row.purchase.amount === 0 ? 'Free' : `$${row.purchase.amount.toFixed(2)}`
}

function getPriceColor(row) {
  return row.purchase.amount === 0 ? 'bg-green' : 'bg-red'
}

function openAddDialog() {
  $q.dialog({
    component: AddPackDialog
  }).onOk(pack => {
   openPackDetails(pack._id)
  })
}

function openPackDetails(id) {
  router.push('/pack/' + id)
}

</script>

<style lang="scss" scoped>
$packHeight: 150px;

.pack-card {
  display: flex;
  flex-direction: column;
  //height: $packHeight;
  box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
  border-radius: 5px;
  cursor: pointer;
  transition: all .5s;

  &:hover {
    box-shadow: rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px;
  }

  .img-wrapper {
    height: $packHeight;
    position: relative;

    img {
      width: 100%;
      max-height: 100%;
      object-fit: cover;
      border-radius: 5px;
    }
  }

  .info-wrapper {
    padding: 10px;
  }

  .name {
    font-size: 16px;

    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2; /* number of lines to show */
    -webkit-box-orient: vertical;
  }

  .description {
    font-size: 12px;

    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 3; /* number of lines to show */
    -webkit-box-orient: vertical;
  }

  .price {
    position: absolute;
    top: 15px;
    right: 0;
    color: #fff;
    padding: 0 6px;
  }

  .count {
    position: absolute;
    top: 15px;
    left: 0;
    color: #fff;
    padding: 0 6px;
  }
}
</style>
