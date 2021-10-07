import { boot } from 'quasar/wrappers'
import {Storage} from "@capacitor/storage";

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async ( { app, router, store } ) => {
  store.commit('app/setIsIntroShown', (await Storage.get({ key: 'intro' }))?.value === "1")

  router.beforeEach((to, from, next) => {
    if (to.name === 'Home' && !store.state.app.isIntroShown) {
      next({ name: 'Intro' })
      return
    }

    next()
  })
})
