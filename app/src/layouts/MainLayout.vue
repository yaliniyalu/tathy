<template>
  <q-layout view="hHh LpR fFf">
    <q-drawer show-if-above v-model="leftDrawerOpen" side="left" bordered>
      <div class="text-center q-pa-md">
        <img :src="require('src/assets/logo.svg')" alt="logo"/>
      </div>

      <q-list>
        <q-item clickable :to="item.to" v-for="item in menu">
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>

          <q-item-section>
            <q-item-label>{{ item.name }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <transition
        enter-active-class="animated fadeIn"
        appear
      >
        <router-view />
      </transition>
    </q-page-container>

  </q-layout>
</template>

<script>

import {computed, defineComponent} from 'vue'
import {useStore} from "vuex";

const menu = [
  { name: 'Home', icon: 'home', to: '/' },
  { name: 'Category', icon: 'category', to: '/category' },
  { name: 'Settings', icon: 'settings', to: '/settings' },
  { name: 'About', icon: 'format_quote', to: '/about' },
]

export default defineComponent({
  name: 'MainLayout',
  setup () {
    const store = useStore()

    const leftDrawerOpen = computed({
      get() {
        return store.state.app.isDrawerOpen
      },
      set(v) {
        store.commit("app/setIsDrawerOpen", v)
      }
    })

    return {
      leftDrawerOpen,
      menu
    }
  }
})
</script>
