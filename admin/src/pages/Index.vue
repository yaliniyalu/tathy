<template>
  <q-page class="q-ma-md">
    <div class="row q-mt-md q-col-gutter-md">
      <div class="col">
        <InfoTile title="Total Facts" :value="data['approvedItemsCount'] ?? '-'" color="teal" icon="attach_money" />
      </div>
      <div class="col">
        <InfoTile title="Total Tags" :value="data['tagsCount'] ?? '-'" color="purple" icon="shopping_cart" />
      </div>
      <div class="col">
        <InfoTile title="Pending Facts" :value="data['pendingItemsCount'] ?? '-'" color="green" icon="people" />
      </div>
      <div class="col">
        <InfoTile title="Pending Reports" :value="data['pendingReportsCount'] ?? '-'" color="cyan" icon="paid" />
      </div>
    </div>

    <div class="row q-mt-lg q-col-gutter-md" v-if="data.items7Days">
      <div class="col">
        <ItemsChart :data="data.items7Days"/>
      </div>
      <div class="col">
        <NewUsersChart :data="data.installs7Days"/>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import InfoTile from "components/dashboard/InfoTile";
import {onMounted, ref} from "vue";
import {api} from "boot/axios";
import ItemsChart from "components/dashboard/ItemsChart";
import NewUsersChart from "components/dashboard/NewUsersChart";

const data = ref({})

onMounted(async () => {
  const res = await api.get('dashboard')
  data.value = res.data.data
})
</script>
