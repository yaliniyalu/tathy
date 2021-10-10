<template>
  <q-page>
    <q-carousel
      v-model="slide"
      transition-prev="scale"
      transition-next="scale"
      swipeable
      animated
      control-color="white"
      navigation
      padding
      class="bg-primary text-white shadow-1 fullscreen"
    >
      <form>

      </form>
      <q-carousel-slide :name="i" class="column no-wrap flex-center" v-for="(val, i) in data">
        <q-icon :name="val.icon" size="56px" />
        <div class="q-mt-md text-center">{{ val.text }}</div>
        <q-btn outline label="Next" class="q-mt-lg" @click="nextSlide" v-if="i < data.length - 1"/>
        <q-btn outline label="Start" class="q-mt-lg" @click="startApp" :loading="loading" v-else/>
      </q-carousel-slide>
    </q-carousel>
  </q-page>
</template>

<script setup>
import {onMounted, ref} from "vue";
import {Storage} from "@capacitor/storage";
import {useRouter} from "vue-router";
import {useStore} from "vuex";
import AppService from "src/services/AppService";
import {App} from "@capacitor/app";

const router = useRouter()
const store = useStore()

const slide = ref(0)
const loading = ref(false)

const data = [
  { icon: 'format_quote', text: 'Live as if you were to die tomorrow. Learn as if you were to live forever.' },
  { icon: 'format_list_numbered', text: 'Over 10,000+ Facts' },
  { icon: 'image', text: 'Facts with images to make learning fun' },
  { icon: 'browser_updated', text: 'New Facts updated everyday' }
]

function nextSlide() {
  slide.value = slide.value + 1
}

async function startApp() {
  loading.value = true
  try {
    // await (new AppService()).registerApp().then().catch()
    store.commit('app/setIsIntroShown', true)
    await Storage.set({ key: 'intro', value: "1" });
  } finally {
    await router.replace("/")
    loading.value = false

  }
}

onMounted(() => {
  AppService.setTheme("#CD5C5C", true, false)
})

document.addEventListener('backbutton', function () {
  if (slide.value === 0) {
    App.exitApp()
  } else {
    slide.value = slide.value - 1
  }
})


</script>

<style scoped>

</style>
