<template>
  <q-dialog ref="dialogRef">
    <q-card style="width: 70vw; max-width: 85vw;">
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-md-6 text-center">
            <div id="preview" ref="svgPreview"></div>
            <q-btn flat icon="refresh" color="primary" label="Reload" @click="reloadSvg"/>
            <q-separator/>


          </div>
          <div class="col-md-6 q-gutter-md">
            <q-input outlined stack-label autogrow v-model="text" :model-value="text" label="Text"/>

            <div>
              <div class="row q-col-gutter-md">
                <q-select class="col" outlined stack-label v-model="type" :model-value="type" label="Type" :options="types"/>

                <q-file class="col" outlined stack-label v-model="uploadedImage" :model-value="uploadedImage"
                        label="Image" accept="image/*" :loading="uploadingImage">
                  <template v-slot:append v-if="currImage.url">
                    <q-btn round dense flat icon="crop" @click.stop="cropImage" />
                  </template>
                  <template v-slot:file="props">
                    <q-badge :color="currImage.name ? 'green' : 'red'" :label="currImage.name ? 'uploaded' : 'no image'"/>
                  </template>
                </q-file>
              </div>
            </div>

            <q-slider v-model="imageHeight" :model-value="imageHeight" :min="0" :max="100"
                      :label-value="'Image Height: ' + imageHeight + '%'" label-always :disable="!text || !image"/>

            <q-checkbox v-model="hasSeparator" :model-value="hasSeparator" label="Has Separator" />

            <!--            <q-slider v-model="fontSize" :model-value="fontSize" :min="fontSizeRange[0]" :max="fontSizeRange[1]"
                                  :label-value="'Font Size: ' + fontSize + 'px'" label-always :disable="!text"/>-->

            <div>
              <div class="row q-col-gutter-md">
                <q-select class="col" v-model="fontFamily" :model-value="fontFamily" outlined stack-label label="Font Family" :options="fontFamilies" :disable="!text"/>
                <q-select class="col" v-model="themeColor" :model-value="themeColor" outlined stack-label label="Theme Color" :options="paletteColors">
                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps">
                      <q-item-section avatar>
                        <div :style="{width: '25px', height: '25px', backgroundColor: scope.opt}"></div>
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ scope.opt }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>

                  <template v-slot:selected>
                    <div class="row items-center">
                      <div class="q-mr-xs" :style="{width: '15px', height: '15px', backgroundColor: themeColor}"></div>
                      <span>{{ themeColor }}</span>
                    </div>
                  </template>
                </q-select>
              </div>
            </div>

            <q-separator/>
            <q-input type="textarea" outlined stack-label autogrow v-model="note" :model-value="note" label="Note"/>
            <q-select outlined stack-label label="Tags" :model-value="tags" v-model="tags"
                      new-value-mode="add-unique" use-input use-chips multiple :options="tagsSearch"
            />
            <q-separator/>

            <div class="q-gutter-md text-right">
              <q-btn flat icon="cancel" color="secondary" label="Cancel" v-close-popup/>
              <q-btn flat icon="replay" color="negative" label="Reset" @click="resetItem" v-if="id"/>
              <q-btn unelevated icon="save" color="primary" label="Save" @click="saveItem" :disable="!text && !image" :loading="savingItem"/>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import {useDialogPluginComponent, useQuasar} from "quasar";
import {computed, onMounted, reactive, ref, watch} from "vue";
import http from "src/http";
import SvgCreator from "src/js/svg-creator";
import ui from "src/ui";
import {crop, getAssetUrl, rgbToHex} from "src/utils";
import ImageCropperDialog from "components/ImageCropperDialog";
import ColorThief from 'colorthief'
import {api} from "boot/axios";

const { dialogRef, onDialogOK } = useDialogPluginComponent()
const $q = useQuasar()

const props = defineProps({
  item: Object,
  pack: String
});
// const emit = defineEmits(['change'])

const types = [
  'None',
  'Did You Know',
  'Fun Fact',
  'Fact'
]

const fontFamilies = [
  "Asap Condensed",
  "Barlow Condensed",
  "Barlow Semi Condensed",
  "Fira Sans Condensed",
  "Open Sans Condensed",
  "Roboto Condensed",
  "Saira Condensed",
  "Stint Ultra Condensed",
  "Ubuntu Condensed"
]

const themeColors = [
  '#CD5C5C',
  '#f44336', '#e91e63',
  '#9c27b0', '#3f51b5',
  '#2196f3'
]

const fontSizeRange = [16, 46];

const id = ref(null)
const text = ref()
const type = ref(types[3])
const image = ref()
const fontFamily = ref(fontFamilies[6])
const themeColor = ref(themeColors[0])
const fontSize = ref(fontSizeRange[0])
const imageHeight = ref(60)
const hasSeparator = ref(true)

const note = ref()
const tags = ref([])

const typeText = computed(() => type.value === 'None' ? null : type.value)
const tagsSearch = ref()
const svgPreview = ref();
const stolenColors = ref([])

const uploadingImage = ref(false)
const uploadedImage = ref()
const savingItem = ref()
const item = ref(null)

const currImage = reactive({
  name: '',
  url: '',
  croppedName: ''
})

const paletteColors = computed(() => {
  const colors = [];

  if (!themeColors.includes(themeColor.value) && !stolenColors.value.includes(themeColor.value)) {
    colors.push(themeColor.value)
  }

  colors.push(...themeColors)
  colors.push(...stolenColors.value)

  return colors
})

/** @type SvgCreator */
let svg = null;

onMounted(async () => {
  const { data } = await http.get('tags')
  tagsSearch.value = data.data.tags.map(v => v.tag)

  unpackItem()

  svg = new SvgCreator(svgPreview.value)

  watch(text, () => svg.setText(text.value), {immediate: true})
  watch(type, () => svg.setTypeText(typeText.value), {immediate: true})
  watch(image, () => setImage(), {immediate: true})
  watch(fontFamily, () => svg.setFontFamily(fontFamily.value), {immediate: true})
  watch(themeColor, () => svg.setThemeColor(themeColor.value), {immediate: true})
  watch(imageHeight, () => svg.setImageHeight(imageHeight.value), {immediate: true})
  watch(hasSeparator, () => svg.setHasSeparator(hasSeparator.value), {immediate: true})
})

function setImage() {
  svg.setImage(image.value)
}

watch(() => currImage.url, () => {
  const img = new Image()
  img.crossOrigin = "anonymous";
  img.onload = () => {
    const thief = new ColorThief()
    const colors = thief.getPalette(img)
    stolenColors.value = colors.map(v => rgbToHex(...v))
  }
  img.src = image.value
})

function reloadSvg() {
  svg.refresh()
}

function unpackItem() {
  if (!props.item) {
    return
  }

  id.value = props.item['_id']
  text.value = props.item['text']
  type.value = props.item['type']
  fontFamily.value = props.item['style']['fontFamily']
  themeColor.value = props.item['style']['themeColor']
  fontSize.value = props.item['style']['fontSize']
  imageHeight.value = props.item['style']['imageHeight']
  hasSeparator.value = props.item['style']['hasSeparator']

  note.value = props.item['note']
  tags.value = props.item['tags']

  image.value = getAssetUrl(props.item['style']['image'], 'items/cropped')
  currImage.name = props.item['image']
  currImage.url = getAssetUrl(props.item['image'], 'items')
  currImage.croppedName = props.item['style']['image']
}

watch(uploadedImage, () => {
  uploadImage()
})

async function uploadImage() {
  uploadingImage.value = true;

  let data = new FormData();
  data.append('file', uploadedImage.value)

  try {
    const res = await http.post(`upload`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    image.value = getAssetUrl(res.data.data.file.filename, 'temp')

    currImage.name = res.data.data.file.filename
    currImage.url = getAssetUrl(res.data.data.file.filename, 'temp')
    currImage.croppedName = res.data.data.file.filename

    await autoCropImage()
  } catch (e) {
    ui.notifyError(e.response?.data.message)
  } finally {
    uploadingImage.value = false
  }
}

async function autoCropImage() {
  return new Promise(async (resolve, reject) => {
    const aspectWidth = svg.getSvgSize().w
    const aspectHeight = svg.h2

    const croppedCanvas = await crop(currImage.url, Math.max(aspectWidth, aspectHeight) / Math.min(aspectWidth, aspectHeight))
    croppedCanvas.toBlob(async blob => {
      let data = new FormData();
      data.append('file', blob);

      const res = await api.post('upload', data, {headers: {'Content-Type': 'multipart/form-data'}})

      image.value = getAssetUrl(res.data.data.file.filename, 'temp')
      currImage.croppedName = res.data.data.file.filename

      resolve()
    })
  })
}

function cropImage() {
  const ratio = svg.getImageSize();
  $q.dialog({
    component: ImageCropperDialog,
    componentProps: {
      url: currImage.url,
      aspectRatio: ratio.width / ratio.height
    }
  }).onOk((file) => {
    image.value = getAssetUrl(file.filename, 'temp')
    currImage.croppedName = file.filename
  })
}

async function saveItem() {
  savingItem.value = true;

  const data = {
    text: text.value || null,
    image: currImage.name || null,
    type: type.value || null,
    style: {
      image: currImage.croppedName || null,
      imageHeight: imageHeight.value,
      hasSeparator: hasSeparator.value,
      fontFamily: fontFamily.value,
      themeColor: themeColor.value,
    },
    notes: note.value,
    tags: tags.value,
    renderedSvg: svg.getRenderedSvg(),
  }

  try {
    const res = await http.post((props.pack ? `pack/${props.pack}/` : '') + `item` + (id.value ? '/' + id.value : ''), data)
    /*id.value = res.data.data.item._id
    image.value = getAssetUrl(res.data.data.item.style.image, 'items/cropped')
    currImage.url = getAssetUrl(res.data.data.item.image, 'temp')*/

    // emit('change', res.data.data.item)
    onDialogOK(res.data.data.item)
    ui.notifySuccess("Item saved")
  } catch (e) {
    ui.notifyError(e.response.data.message)
  } finally {
    savingItem.value = false
  }
}

function resetItem() {
  unpackItem()
}
</script>

<style lang="scss" scoped>

</style>
