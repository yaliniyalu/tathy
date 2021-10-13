<template>
  <q-layout view="hHh LpR lfr">

    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />
        <q-avatar rounded class="bg-white">
          <img :src="require('src/assets/icon.svg')" alt="logo">
        </q-avatar>
        <q-toolbar-title>Tathy</q-toolbar-title>

        <q-space />

        <q-btn stretch flat :label="user.name">
          <q-menu>
            <div class="row no-wrap q-pa-md">
              <div class="column items-center">
                <q-avatar size="72px"> <img :src="getAvatarUrl(user)" alt="avatar"/></q-avatar>
                <span class="text-bold text-primary">{{ user.name }}</span>
                <span class="text-grey">{{ user.role }}</span>
                <q-btn class="q-mt-md" unelevated color="primary" label="Logout" size="sm" @click="logout" v-close-popup/>
              </div>
            </div>
          </q-menu>
        </q-btn>
      </q-toolbar>


    </q-header>

    <q-drawer show-if-above v-model="leftDrawerOpen" side="left" bordered>
      <q-list>
        <q-item-label header>
          Menu
        </q-item-label>

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
      <router-view />
    </q-page-container>

    <q-footer class="text-grey-8 text-center bg-transparent">
      <span>&copy; 2021. <a class="text-grey-8" href="#">Tathy</a>. All rights reserved</span>
    </q-footer>
  </q-layout>
</template>

<script>
import {computed, defineComponent, ref} from 'vue'
import {getAvatarUrl} from "src/utils";
import {useStore} from "vuex";
import {useRouter} from "vue-router";

const menu = [
  { icon: 'home', name: 'Home', to: '/', role: '*' },
  // { icon: 'inventory_2', name: 'Packs', to: '/packs', role: '*' },
  { icon: 'inventory_2', name: 'Items', to: '/items', role: '*' },
  { icon: 'report_problem', name: 'Reports', to: '/reports', role: '*' },
  // { icon: 'people', name: 'Accounts', to: '/accounts', role: 'admin' },
  { icon: 'manage_accounts', name: 'My Account', to: '/accounts/me', role: '*' },
]

export default defineComponent({
  name: 'MainLayout',

  setup () {
    const leftDrawerOpen = ref(false)

    const store = useStore()
    const router = useRouter()

    const user = computed(() => store.state.app.user)

    async function logout() {
      await store.dispatch('app/logout')
      await router.push('/login');
    }

    return {
      leftDrawerOpen,
      toggleLeftDrawer: () => leftDrawerOpen.value = !leftDrawerOpen.value,
      menu,
      getAvatarUrl,
      user,
      logout
    }
  }
})
</script>
