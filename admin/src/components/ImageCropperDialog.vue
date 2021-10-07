<template>
  <q-dialog ref="dialogRef">
    <q-card style="width: 60%" v-if="url">
      <q-card-section>
        <vue-cropper
          ref="cropper"
          :src="url"
          alt="Source Image"
          :aspectRatio="aspectRatio"
        >
        </vue-cropper>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="secondary" @click="onCancelClick"/>
        <q-btn label="Save" color="primary" @click="saveImage" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import {defineComponent, onBeforeUnmount, onMounted, ref} from 'vue';
import {useDialogPluginComponent} from "quasar";
import http from "src/http";
import ui from "src/ui";

export default defineComponent({
  name: 'ImageCropperDialog',

  props: {
    url: {
      type: String,
      required: true
    },
    aspectRatio: {
      type: [String, Number],
      default: 1
    }
  },

  setup() {
    const { dialogRef, onDialogOK, onDialogCancel } = useDialogPluginComponent()

    const cropper = ref()
    const loading = ref()

    function saveImage() {
      loading.value = true
      cropper.value.getCroppedCanvas().toBlob((blob) => {
        let data = new FormData();
        data.append('file', blob, "file.png")
        http.post(`upload`, data, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
          .then(res => {
            onDialogOK(res.data.data.file)
          }).catch(e => {
            ui.notifyError(e.response.data.message)
          }).finally(() => {
            loading.value = false
          });
      }, 'image/png');
    }

    return {
      dialogRef,

      saveImage,

      cropper,
      loading,

      onCancelClick: onDialogCancel
    }
  }
})
</script>

<style lang="scss" scoped>

</style>
