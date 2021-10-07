<template>
  <div>
    <div :class="`image-preview preview-${props.layout}`" v-if="src">
      <img class="image" :src="src" :alt="alt"/>
      <div class="overlay" @click="openImage" v-if="!readonly">
        <span>Change</span>
      </div>
    </div>
      <div v-if="!src && !readonly">
        <q-btn color="secondary" flat label="Upload Image" @click="openImage"/>
      </div>
  </div>
</template>

<script setup>
import {onBeforeUnmount, toRefs} from "vue";
import ImageCropperDialog from "components/ImageCropperDialog";
import {useQuasar} from "quasar";

const props = defineProps({
  src: String,
  defaultSrc: String,
  alt: {
    type: String,
    default: ""
  },
  readonly: {
    type: Boolean,
    default: false
  },
  layout: String
});
const emit = defineEmits(['change'])

const { src, defaultSrc, readonly, alt } = toRefs(props);
const $q = useQuasar()

function openImage() {
  input.click()
}

onBeforeUnmount(() => {
  input.removeEventListener("change", onFileChange);
})

const input = document.createElement('input');
input.type = 'file';
input.accept = "image/*";
input.addEventListener("change", onFileChange);

function onFileChange() {
  const url = window.URL.createObjectURL(this.files[0])
  $q.dialog({
    component: ImageCropperDialog,
    componentProps: {
      url
    }
  }).onOk((file) => {
     emit('change', file);
  })
}

</script>

<style lang="scss" scoped>
.image-preview {
  position: relative;

  width: 100%;
  height: 100%;

  &.preview-round {
    .image, .overlay {
      border-radius: 50%;
    }
  }

  &.preview-rounded {
    .image, .overlay {
      border-radius: 5px;
    }
  }

  .image {
    width: 100%;
    height: 100%;
    display: block;
  }

  .overlay {
    width: 100%;
    height: 100%;
    background: #000000ab;
    color: var(--q-primary);
    position: absolute;
    top: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    visibility: hidden;
    opacity: 0;
    transition: all 0.3s;

    span {
      font-weight: bold;
    }
  }

  &:hover .overlay {
    visibility: visible;
    opacity: 1;
  }
}
</style>
