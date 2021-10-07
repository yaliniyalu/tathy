<template>
  <q-page class="q-pa-xs flex flex-center gallery bg-black">
      <q-carousel
        v-model="slide"
        transition-prev="jump-down"
        transition-next="jump-up"
        vertical
        swipeable
        animated
        class="bg-black"
        height="100%"
        style="width: 100%"
        fullscreen
      >
        <q-carousel-slide :name="i" class="column no-wrap flex-center q-pa-none"  v-for="(item, i) in items">
          <div class="viewer-container" :style="`width: ${displayWidth}`" ref="imgWrapperRef">
            <q-img style="width: 100%" :src="getAssetsUrl(`${item._id}_${imageSize}.jpg`, 'items/rendered')" alt="image" @dblclick="likeItem"/>
          </div>
        </q-carousel-slide>

        <template v-slot:control>
          <q-page-sticky position="bottom-right" :offset="[18, 42]">
            <q-fab
              v-model="fab"
              label="Actions"
              external-label
              vertical-actions-align="left"
              color="dark"
              icon="more_vert"
              direction="up"
            >
              <q-fab-action external-label label-position="left" color="primary" @click="shareItem" icon="share" label="Share" />
              <q-fab-action external-label label-position="left" color="accent" @click="bookmarkItem" icon="bookmark" label="Bookmark" />
              <q-fab-action external-label label-position="left" color="secondary" @click="reportItem" icon="report_problem" label="Report" />
            </q-fab>
          </q-page-sticky>

          <q-page-sticky position="top" :offset="[0, 18]">
            <b class="text-white">{{ slide + 1 }}/{{ items.length }}</b>
          </q-page-sticky>
        </template>
      </q-carousel>
  </q-page>
</template>

<script setup>
import {onBeforeUnmount, onMounted, ref, watch} from "vue";
import {api} from "boot/axios";
import {useQuasar} from "quasar";
import {useRoute, useRouter} from "vue-router";
import {StatusBar, Style} from "@capacitor/status-bar";
import {getAssetsUrl, getOptimizeImageSize} from 'src/utils';
import ItemService from "src/services/ItemService";
import {PackModel} from "src/services/PackService";

const quasar = useQuasar()
const route = useRoute()
const router = useRouter()

const id = route.params.id

const items = ref([])
const imageSize = ref("720")
const slide = ref(0)
const fab = ref()
const imgWrapperRef = ref()

const packService = new PackModel({ _id: id })

watch(slide, () => {
  packService.setLearningIndex(slide.value)
})

const displayWidth = ref("100%")
if (window.screen.width > window.screen.height) {
  displayWidth.value = imageSize.value + "px"
}

onMounted(async () => {
  await StatusBar.setStyle({ style: Style.Dark });
  await StatusBar.setBackgroundColor({color: "#000000"})

  window.NavigationBar?.backgroundColorByHexString("#000000", false);
  window.NavigationBar?.hide();
})

onMounted(async () => {
  quasar.loading.show()
  const res = await api.get(`/pack/${id}/items`);
  items.value = res.data.data.items
  quasar.loading.hide()

  document.addEventListener('backbutton', handleBackButton)
})

onBeforeUnmount(() => {
  document.removeEventListener('backbutton', handleBackButton)

  StatusBar.setStyle({ style: Style.Light });
  StatusBar.setBackgroundColor({color: "#ffffff"})

  window.NavigationBar?.backgroundColorByHexString("#ffffff", true);
  window.NavigationBar?.show();
})

async function likeItem(e) {
  createHeart(e)
  await ItemService.likeItem(items.value[slide.value]._id, true)
}

const createHeart = (e) => {
  const heart = document.createElement('span')
  heart.classList.add("material-icons")
  heart.classList.add("heart-liked")
  heart.innerHTML = "favorite"

  heart.style.position = "absolute"
  heart.style.animation = "grow 0.6s linear"
  heart.style.transform = "translate(-50%, -50%) scale(0)"
  heart.style.color = "#f44336"

  const x = e.clientX
  const y = e.clientY

  const leftOffset = e.target.offsetLeft
  const topOffset = e.target.offsetTop

  const xInside = x - leftOffset
  const yInside = y - topOffset

  heart.style.top = `${yInside}px`
  heart.style.left = `${xInside}px`

  imgWrapperRef.value.appendChild(heart)

  setTimeout( () => heart.remove(), 5000)
}

function handleBackButton(e) {
  e.preventDefault()
  router.go(-1)
}

function shareItem() {
  const item = items.value[slide.value];
  const options = {
    message: item.text,
    subject: item.type,
    files: [getAssetsUrl(`${item._id}_720.jpg`, 'items/rendered/shared')]
  };

  window.plugins.socialsharing.shareWithOptions(options);
}

function bookmarkItem() {
  quasar.notify({
    message: 'Bookmarked',
    icon: 'done',
    timeout: 2000
  })
}

function reportItem() {
  const item = items.value[slide.value]._id;

  quasar.dialog({
    message: 'What do you want to report?',
    prompt: {
      model: '',
      type: 'textarea',
      isValid: val => val.length > 5 && val.length < 2500,
      outlined: true, stackLabel: true,
      counter: true,
    },
    cancel: true,
    persistent: true
  }).onOk(data => {
    reportItemRequest(item, data)
  })
}

async function reportItemRequest(id, report) {
  quasar.loading.show()
  try {
    await api.post(`/item/${id}/report`, {report: report})
    quasar.dialog({
      message: 'Your report has been submitted. We will enquire it as soon as possible',
      color: 'primary'
    })
  } catch (e) {
  } finally {
    quasar.loading.hide()
  }
}


</script>

<style lang="scss">
.gallery {
}

.viewer-container {
  display: flex;
  justify-content: center;
  align-items: center
}
</style>

<style>
@keyframes grow {
  to {
    transform: translate(-50%, -50%) scale(10);
    opacity: 0;
  }
}
</style>
