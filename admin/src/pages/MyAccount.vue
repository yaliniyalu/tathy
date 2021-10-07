<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <div class="col-md-3 col-sm-6 col-xs-12">
        <q-card class="account-details-card">
          <q-card-section class="account-details" v-if="user">
            <ImagePreview class="image-preview" :src="getAvatarUrl(user)" layout="round" @change="onImageChange"/>

            <div class="name-container">
              <h5 class="name">{{ user['name'] }} <q-icon class="edit-icon" name="edit" @click="openChangeName"/></h5>
            </div>

            <p class="email">{{ user['email'] }}</p>
            <b class="role">{{ user['role'] }}</b>
          </q-card-section>

          <q-inner-loading :showing="!user">
            <q-spinner-bars size="50px" color="primary" />
          </q-inner-loading>
        </q-card>
      </div>
      <div class="col">
        <q-stepper class="q-dialog-plugin" v-model="step" ref="stepper" color="primary" animated>
          <q-step :name="1" title="Current Password" icon="vpn_key" :done="step > 1">
            <q-input :type="isPwd ? 'password' : 'text'" outlined stack-label label="Current Password" :error="!!error" :error-message="error" v-model="password" :model-value="password">
              <template v-slot:prepend>
                <q-icon name="lock" />
              </template>
              <template v-slot:append>
                <q-icon :name="isPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="isPwd = !isPwd"/>
              </template>
            </q-input>

            <div class="text-center q-mt-md">
              <q-btn color="primary" label="Next" @click="changePasswordNextStep" />
            </div>
          </q-step>

          <q-step :name="2" title="Change Password" icon="lock" :done="step > 1">
            <div class="q-gutter-md">
              <q-input :type="isPwd ? 'password' : 'text'" outlined stack-label label="New Password" v-model="password1" :model-value="password1">
                <template v-slot:prepend>
                  <q-icon name="lock" />
                </template>
                <template v-slot:append>
                  <q-icon :name="isPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="isPwd = !isPwd"/>
                </template>
              </q-input>

              <q-input :type="isPwd2 ? 'password' : 'text'" outlined stack-label label="Re-enter Password" :error="!!error" :error-message="error" v-model="password2" :model-value="password2">
                <template v-slot:prepend>
                  <q-icon name="lock" />
                </template>
                <template v-slot:append>
                  <q-icon :name="isPwd2 ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="isPwd2 = !isPwd2"/>
                </template>
              </q-input>
            </div>

            <div class="text-center q-mt-md q-gutter-md">
              <q-btn color="primary" label="Change Password" @click="changePassword" :loading="loading" />
              <q-btn color="secondary" flat label="Go Back" @click="step -= 1" />
            </div>
          </q-step>
        </q-stepper>
      </div>
      <div class="col">
        <q-card>
          <q-card-section>
            To update you email please contact administrator. If you are the administrator please use accounts page to update your email.
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import {computed, defineComponent, onBeforeUnmount, ref, watch} from 'vue';
import {useStore} from "vuex";
import {getAvatarUrl} from "src/utils";
import http from "src/http";
import ui from "src/ui";
import ImageCropperDialog from "components/ImageCropperDialog";
import {useQuasar} from "quasar";
import ImagePreview from "components/ImagePreview";

export default defineComponent({
  name: 'PageMyAccount',
  components: {ImagePreview},
  setup() {
    const store = useStore()
    const user = computed(() => store.state.app.user)
    const $q = useQuasar()

    const step = ref(1)
    const error = ref()
    const loading = ref(false)
    const imageLoading = ref(false)
    const password = ref()
    const password1 = ref()
    const password2 = ref()
    const isPwd = ref(true)
    const isPwd2 = ref(true)

    watch([password, password1, password2], () => error.value = null)

    function changePasswordNextStep() {
      error.value = null

      if (!password.value) {
        error.value = "Enter password"
        return
      }

      step.value += 1
    }

    async function changePassword() {
      error.value = null

      if (!password1.value || password1.value.length < 6) {
        error.value = "Password must be 6 characters long"
        return
      }

      if (password1.value !== password2.value) {
        error.value = "Passwords mismatch"
        return
      }

      try {
        loading.value = true
        await http.patch("user/me", {
          password: password1.value,
          authenticate: password.value
        })

        ui.notifySuccess("Password changed Successfully")

      } catch (e) {
        error.value = e.response.data.message
        if (e.response.status === 401) {
          step.value = 1
        }
        return;
      } finally {
        loading.value = false
      }

      password.value = null;
      password1.value = null
      password2.value = null;
      step.value = 1
    }

    function onImageChange(file) {
      updateProfile(file.filename)
    }

    async function updateProfile(image) {
      try {
        loading.value = true
        const res = await http.patch("user/me", {image})
        await store.dispatch("app/setUser", res.data.data.user)

        ui.notifySuccess("Profile updated Successfully")
      } catch (e) {
        ui.notifyError("Unable to upload the image")
      } finally {
        loading.value = false
      }
    }

    async function updateName(name) {
      try {
        loading.value = true
        const res = await http.patch("user/me", {name})
        await store.dispatch("app/setUser", res.data.data.user)

        ui.notifySuccess("Profile updated Successfully")
      } catch (e) {
        ui.notifyError("Unable to update the name")
      } finally {
        loading.value = false
      }
    }

    function openChangeName() {
      $q.dialog({
        title: 'Enter your name',
        prompt: {
          model: '',
          isValid: val => !!val,
        },
        cancel: true,
        persistent: true
      }).onOk(data => {
        updateName(data)
      })
    }

    return {
      user,
      step,
      password,
      password1,
      password2,
      error,
      loading,
      imageLoading,
      isPwd,
      isPwd2,
      changePasswordNextStep,
      changePassword,
      onImageChange,
      openChangeName,
      getAvatarUrl
    }
  }
})
</script>

<style lang="scss" scoped>
.account-details {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;

  .name-container {
    width: 100%;
    display: flex;
    justify-content: center;

    .name {
      margin: 0;
      transition: all;
      position: relative;
      display: flex;
      align-items: center;
    }

    .edit-icon {
      visibility: hidden;
      position: absolute;
      right: -26px;
      cursor: pointer;
      color: var(--q-primary);
    }

    &:hover .edit-icon {
      visibility: visible;
    }
  }

  .email {
    margin: 0;
  }

  .role {
    margin: 0;
  }
}

.image-preview {
  width: 100px;
  height: 100px;
}
</style>
