import { boot } from 'quasar/wrappers'
import Service from "src/services/Service";

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async (/* { app, router, ... } */) => {
  try {
    const service = new Service()
    await service.createAllTables()
  } catch (e) {
  }
})
