<template>
  <q-header class="bg-white text-white header" v-if="!isHome">
    <q-toolbar>
      <q-btn color="primary" dense flat round icon="arrow_back" @click="goBack"/>
      <q-toolbar-title class="text-primary"><b class="text-primary title" v-if="title">{{ title }}</b></q-toolbar-title>

      <q-btn color="primary" dense flat round icon="search" @click="search"/>
    </q-toolbar>
  </q-header>

  <q-header class="bg-white text-white" v-if="isHome">
    <q-toolbar>
      <q-btn color="primary" dense flat round icon="menu" @click="toggleLeftDrawer" />
      <q-space/>
      <q-toolbar-title>
        <AppTitle class="text-right"/>
      </q-toolbar-title>
    </q-toolbar>
  </q-header>
</template>

<script setup>
import {useRoute, useRouter} from "vue-router";
import {useQuasar} from "quasar";
import SearchDialog from "components/SearchDialog";
import AppTitle from "components/AppTitle";
import {computed} from "vue";
import {useStore} from "vuex";

const props = defineProps({
  title: {
    type: String,
    required: false,
    default: null
  }
});

const quasar = useQuasar()
const router = useRouter()
const route = useRoute()
const store = useStore()

const isHome = route.name === "Home"

const leftDrawerOpen = computed({
  get() {
    return store.state.app.isDrawerOpen
  },
  set(v) {
    store.commit("app/setIsDrawerOpen", v)
  }
})

function toggleLeftDrawer () {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function goBack() {
  router.go(-1)
}

function search() {
  quasar.dialog({
    component: SearchDialog
  })
}
</script>

<style lang="scss" scoped>
.title {
  font-size: 18px;
  line-height: 1;
}

.header {
  position: fixed;
}
</style>
