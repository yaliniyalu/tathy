<template>
  <q-dialog ref="dialogRef">
    <q-stepper style="width: 50%;" class="q-dialog-plugin" v-model="step" ref="stepper" color="primary" animated>

      <q-step :name="1" title="Verify Email" icon="person" :done="step > 1">
        <p>Please enter your registered email id.</p>
        <q-input outlined stack-label label="Email" :error="!!error" :error-message="error" model-value="" v-model="email">
          <template v-slot:prepend>
            <q-icon name="person" />
          </template>
        </q-input>

        <div class="text-center q-mt-md">
          <q-btn color="primary" label="Verify" @click="verifyEmail" :loading="loading" />
        </div>
      </q-step>

      <q-step :name="2" title="Verify Code" icon="vpn_key" :done="step > 2">
        <p>The verification code has been sent to {{ email }}. Please enter the code below to verify.</p>
        <q-input outlined stack-label label="Code" :error="!!error" :error-message="error" model-value="" v-model="code">
          <template v-slot:prepend>
            <q-icon name="vpn_key" />
          </template>
        </q-input>

        <div class="text-center q-mt-md">
          <q-btn color="primary" label="Verify" @click="verifyOtp" :loading="loading" />
        </div>
      </q-step>

      <q-step :name="3" title="Reset Password" icon="lock" :done="step > 3">
        <q-form class="q-gutter-md">
          <q-input :type="isPwd ? 'password' : 'text'" outlined stack-label label="Password" :error="!!error" :error-message="error" v-model="password"  model-value="">
            <template v-slot:prepend>
              <q-icon name="lock" />
            </template>
            <template v-slot:append>
              <q-icon :name="isPwd ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="isPwd = !isPwd"/>
            </template>
          </q-input>

          <q-input :type="isPwd2 ? 'password' : 'text'" outlined stack-label label="Re-enter Password" v-model="password2"  model-value="">
            <template v-slot:prepend>
              <q-icon name="lock" />
            </template>
            <template v-slot:append>
              <q-icon :name="isPwd2 ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="isPwd2 = !isPwd2"/>
            </template>
          </q-input>
        </q-form>

        <div class="text-center q-mt-md">
          <q-btn color="primary" label="Verify" @click="changePassword" :loading="loading" />
        </div>
      </q-step>

    </q-stepper>
  </q-dialog>
</template>

<script>
import { useDialogPluginComponent } from 'quasar'
import {defineComponent, ref} from "vue";
import ui from "src/ui";
import http from "src/http";

export default defineComponent({
  name: 'ForgetPasswordDialog',

  setup() {
    const { dialogRef, onDialogOK } = useDialogPluginComponent()

    const step = ref(1)
    const email = ref()
    const code = ref()
    const password = ref()

    const isPwd = ref(true)
    const isPwd2 = ref(true)
    const password2 = ref()

    const error = ref()

    const loading = ref(false)

    let token = null;

    async function verifyEmail() {
      try {
        error.value = null
        loading.value = true
        await http.post("auth/recover-password", {email: email.value})
        step.value = 2;
      } catch (e) {
        error.value = e.response.data.message
      } finally {
        loading.value = false
      }
    }

    async function verifyOtp() {
      try {
        error.value = null
        loading.value = true
        const res = await http.get("auth/recover-password/verify", {params: {email: email.value, code: code.value}})
        token = res.data.data.token
        step.value = 3;
      } catch (e) {
        error.value = e.response.data.message
      } finally {
        loading.value = false
      }
    }

    async function changePassword() {
      error.value = null;

      if (!password.value || (password.value !== password2.value)) {
        error.value = "Passwords doesn't match."
        return
      }

      if (password.value.length < 6) {
        error.value = "Password must be 6 characters long"
        return;
      }

      try {
        loading.value = true
        await http.post("auth/recover-password/change", {password: password.value, token: token})
        ui.notifySuccess("Password changed successfully")
        onDialogOK()
      } catch (e) {
        error.value = e.response.data.message
      } finally {
        loading.value = false
      }
    }

    return {
      step, email, code, password, isPwd, isPwd2, password2,
      error, loading,

      verifyEmail,
      verifyOtp,
      changePassword,

      dialogRef,
    }
  }
})
</script>

<style scoped>

</style>
