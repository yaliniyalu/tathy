import { boot } from 'quasar/wrappers'
import AdService from "src/services/AdService";

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async (/* { app, router, ... } */) => {
  const adService = new AdService()
  await adService.initialize()
})
