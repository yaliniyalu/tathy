<template>
  <q-page class="flex flex-center gallery">
    <q-carousel
      v-model="slide"
      :transition-prev="transition.prev"
      :transition-next="transition.next"
      :vertical="swiperDirection !== 'horizontal'"
      swipeable
      animated
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
        <q-page-sticky position="top-right" :offset="[18, 8]">
          <q-btn icon="menu" round flat color="white" @click="openMenu"/>
        </q-page-sticky>

        <q-page-sticky position="top" :offset="[0, 18]" class="text-center">
          <b class="text-white">{{ slide + 1 }}/{{ totalCount }}</b><br>
          <q-badge color="grey" @click="router.back()" v-if="tag">Tag '{{ tag }}'</q-badge>
        </q-page-sticky>

        <q-page-sticky position="top-left" :offset="[18, 18]">
          <b class="text-white brand-title"><span>T</span><span>athy</span></b>
        </q-page-sticky>

        <q-page-sticky expand position="bottom" :offset="[0, isBannerAdShown ? 50 : 18]">
          <div class="flex justify-evenly" style="width: 100%">
            <div>
              <q-fab v-model="fab" external-label vertical-actions-align="right" flat color="white" icon="more_horiz" direction="up">
                <!--              <q-fab-action external-label label-position="right" color="accent" @click="bookmarkItem" icon="bookmark" label="Bookmark" />-->
                <q-fab-action external-label label-position="right" color="secondary" @click="reportItem" icon="report_problem" label="Report" />
              </q-fab>
            </div>
            <div>
              <q-btn icon="share" round flat padding="md" color="white" @click="shareItem" :loading="sharing">
                <q-tooltip class="bg-dark" :offset="[10, 10]">Share</q-tooltip>
              </q-btn>
            </div>
            <div>
              <q-btn icon="file_download" round flat padding="md" color="white" @click="downloadItem" :loading="downloading">
                <q-tooltip class="bg-dark" :offset="[10, 10]">Download</q-tooltip>
              </q-btn>
            </div>
          </div>
        </q-page-sticky>
      </template>
    </q-carousel>

    <q-inner-loading :showing="loading" class="gallery">
      <q-spinner-bars size="50px" color="primary"/>
    </q-inner-loading>
  </q-page>
</template>

<script setup>
import 'swiper/css';
import {computed, nextTick, onBeforeUnmount, onMounted, ref, watch} from "vue";
import {useQuasar} from "quasar";
import {useStore} from "vuex";
import {useRoute, useRouter} from "vue-router";
import {Directory, Filesystem} from "@capacitor/filesystem";
import {api} from "boot/axios";
import {getAssetsUrl} from 'src/utils';
import ItemService from "src/services/ItemService";
import AppService from "src/services/AppService";
import AdService from "src/services/AdService";

const quasar = useQuasar()
const route = useRoute()
const router = useRouter()
const store = useStore()

const tag = route.query.tag
const imageSize = ref("720")
const fab = ref()
const imgWrapperRef = ref()

const displayWidth = ref((window.screen.width) + "px")
if (window.screen.width > window.screen.height) {
  displayWidth.value = imageSize.value + "px"
}

const loading = ref(false)
const sharing = ref(false)
const downloading = ref(false)
const totalCount = ref(null)
const items = ref([])
const seenCount = ref(0)
const shouldShowAds = ref(false)
const preloadedImages = []

let slide = null
if (tag) {
  slide = ref(0)
} else {
  slide = computed({
    get: () => store.state.app.currentFact,
    set: (v) => store.dispatch('app/setCurrentFact', v)
  })
}

const swiperDirection = computed(() => store.state.app.swiperDirection)
const isBannerAdShown = computed({
  get: () => store.state.app.isBannerAdShown,
  set: v => store.dispatch("app/setIsBannerAdShown", v)
})

/** @type {ComputedRef<{prev: string, next: string}>}*/
const transition = computed(() => {
  if (swiperDirection.value === 'vertical') {
    return {
      prev: 'jump-down',
      next: 'jump-up'
    }
  } else {
    return {
      prev: 'jump-right',
      next: 'jump-left'
    }
  }
})

const adService = new AdService()

onMounted(async () => {

    // const fromIndex = Math.max(0, currentIndex.value - 10)
  await fetchItems(0)

  for (let i = slide.value - 2; i <= slide.value + 2; i++) {
    if (i < 0) continue
    preloadImage(i)
  }
})

onMounted(() => {
  showBannerAd()
})

onBeforeUnmount(() => {
  hideBannerAd()
})

async function showBannerAd() {
  if (!shouldShowAds.value) return

  await adService.showBanner()
  isBannerAdShown.value = true
}

async function hideBannerAd() {
  if (!isBannerAdShown.value) return

  await adService.hideBanner()
  isBannerAdShown.value = false
}

function preloadImage(index) {
  const img = new Image()
  img.src = getAssetsUrl(`${items.value[index]._id}_${imageSize.value}.jpg`, 'items/rendered');
  preloadedImages.push(img)

  if (preloadedImages.length > 5) {
    preloadedImages.shift()
  }
}

watch(slide, async (curr, prev) => {
  if (curr - prev) {
    seenCount.value ++
    preloadImage(curr + 3)
  } else {
    preloadImage(curr - 3)
  }
})

watch(totalCount, () => store.dispatch("app/setTotalFacts", totalCount))

watch(seenCount, () => {
  if (!shouldShowAds.value) return

  if (seenCount.value % 12 === 0) {
    try {
      adService.showInterstitial()
    } catch (e) {
      alert(e)
    }
  }
})

async function fetchItems(from, limit) {
  if (!tag && store.state.app.facts.length) {
    items.value = store.state.app.facts
    totalCount.value = store.state.app.totalFacts
    return;
  }

  loading.value = true
  try {
    const res = await api.get(`/items`, {
      params: {
        tag: tag,
        fromIndex: from,
        withCount: totalCount.value === null
      }
    })

    const data = res.data.data
    if (totalCount.value === null) {
      totalCount.value = data.count
    }

    items.value = Object.freeze(data.items)

    if (!tag) {
      await store.dispatch("app/setFacts", data.items)
    }
  } catch (e) {
    notify({message: e.message, color: 'negative'})
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await AppService.setTheme("#121212", false, false)
})

onBeforeUnmount(async () => {
  // await AppService.setTheme("#121212", false, true)
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

function openMenu() {
  router.push('/menu')
}

function shareItem() {
  sharing.value = true
  const item = items.value[slide.value];
  const options = {
    message: item.text,
    subject: item.type,
    files: [getAssetsUrl(`${item._id}_720.jpg`, 'items/rendered/shared')]
  };

  function onFinish() {
    sharing.value = false
  }

  window.plugins.socialsharing.shareWithOptions(options, onFinish, () => {
    notify({
      type: 'negative',
      message: 'Sharing Failed',
      icon: 'report_problem',
      timeout: 2000
    })
    onFinish()
  });
}

function bookmarkItem() {
  ItemService.bookmarkItem(items.value[slide.value]._id, true)
  notify({
    message: 'Bookmarked',
    icon: 'done',
    timeout: 2000
  })
}

const convertBlobToBase64 = (blob) => new Promise((resolve, reject) => {
  const reader = new FileReader;
  reader.onerror = reject;
  reader.onload = () => {
    resolve(reader.result);
  };
  reader.readAsDataURL(blob);
});

async function downloadItem() {
  try {
    downloading.value = true
    const path = 'Pictures/tathy'
    const directory = Directory.ExternalStorage

    try {
      await Filesystem.stat({path, directory})
    } catch (e) {
      await Filesystem.mkdir({path, directory, recursive: true})
    }

    const item = items.value[slide.value];
    const url = getAssetsUrl(`${item._id}_720.jpg`, 'items/rendered/shared')
    const blob = await fetch(url).then(res => res.blob());
    const base64Data = await convertBlobToBase64(blob);

    const filename = `${path}/${item.index}_${Math.round(new Date().getTime()/1000)}.jpg`
    await Filesystem.writeFile({
      path: filename,
      data: base64Data,
      directory
    });

    notify({
      message: "Saved: " + filename,
      multiLine: true,
      icon: 'done',
      timeout: 1500
    })
  } catch(e) {
    notify({
      type: 'negative',
      message: "Download Failed",
      icon: 'report_problem',
      timeout: 2000
    })
  } finally {
    downloading.value = false
  }
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

function notify(opts) {
  if (isBannerAdShown.value) {
    opts.classes = 'notify-above-ad'
  }
  quasar.notify(opts)
}

</script>

<style lang="scss">
.gallery {
  background-color: #121212
}

.viewer-container {
  display: flex;
  justify-content: center;
  align-items: center
}

.brand-title {
  line-height: 20px;
  font-size: 30px;
}

.notify-above-ad {
  margin-bottom: 60px;
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
