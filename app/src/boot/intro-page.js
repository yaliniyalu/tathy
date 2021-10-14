import { boot } from 'quasar/wrappers'

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async ( { app, router, store } ) => {
  router.beforeEach((to, from, next) => {
    if (to.name === 'Home' && !store.state.app.isIntroShown) {
      next({ name: 'Intro' })
      return
    }

    next()
  })
})
