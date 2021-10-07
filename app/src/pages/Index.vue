<template>
  <q-page class="q-pa-md bg-white">
    <AppHeader/>

    <div class="search-container">
        <q-input outlined rounded dense model-value="" type="search" placeholder="What are you looking for?" @focus="search" ref="searchRef">
          <template v-slot:append>
            <q-icon color="primary" name="search"/>
          </template>
        </q-input>
    </div>

    <div class="q-mt-md">
      <template v-for="sample in samples">
        <CategorySampleSwiper :sample="sample" />
      </template>
    </div>
  </q-page>
</template>

<script setup>
import {onBeforeMount, onMounted, ref} from 'vue';
import PackCard from "components/PackCard";

import { StatusBar, Style } from '@capacitor/status-bar';
import {api} from "boot/axios";
import CategoryTitleLink from "components/CategoryTitleLink";
import AppHeader from "components/AppHeader";
import CategorySampleSwiper from "components/CategorySampleSwiper";
import SearchDialog from "components/SearchDialog";
import {useQuasar} from "quasar";

const quasar = useQuasar()

const samples = ref([])
const searchRef = ref()

onBeforeMount(() => {
  StatusBar.setStyle({ style: Style.Light });
  StatusBar.setBackgroundColor({color: "#ffffff"})
  window.NavigationBar?.backgroundColorByHexString("#ffffff", true);
})

onMounted(async () => {
  const res = await api.get("category/sample")
  samples.value = res.data.data.sample
})

function search() {
  searchRef.value.blur()
  quasar.dialog({
    component: SearchDialog
  })
}

</script>

<style lang="scss">

.app-title {
  margin: 5px 0 25px 0;
}


.search-container {
  margin: 0;
}

.search {
  width: 100%;
  position: relative;
  display: flex;
  background: #f2f2f2;
}

.search-input {
  width: 100%;
  border: 3px solid var(--q-primary);
  border-right: none;
  border-radius: 25px 0 0 25px;
  outline: none;
  color: #9DBFAF;
  background: #f2f2f2;
  padding-left: 15px;
}

.search-input:focus{
  color: var(--q-primary);
}

.search-button {
  width: 40px;
  height: 40px;
  border: 3px solid var(--q-primary);
  border-left: 0;
  color: var(--q-primary);
  text-align: center;
  border-radius: 0 25px 25px 0;
  cursor: pointer;
  font-size: 20px;
}

</style>
