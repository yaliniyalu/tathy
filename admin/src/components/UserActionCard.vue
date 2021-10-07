<template>
  <div>
<!--    <div class="user-action-card" ref="c1" @click="click">
      <div><span>Created by Someone at some day</span></div>
    </div>-->

    <q-card v-bind="props2" ref="c1" bordered flat @click="isShown = !isShown">
      <q-card-section class="row" v-if="isShown">
        <strong>{{ action }}</strong>
        <q-space/>
        <span class="text-grey-8">{{ humanDateTime(date) }}</span>
      </q-card-section>

      <q-card-section class="row" v-else>
        <strong>{{ action }}</strong> &nbsp; by &nbsp;
        <strong>{{ props.user['name'] }}</strong> &nbsp; at &nbsp;
        <strong>{{ humanDateTime(date) }}</strong>
      </q-card-section>

      <q-separator/>

      <q-card-section class="text-center" v-if="isShown">
        <div class="row no-wrap">
          <div class="column items-center">
            <q-avatar size="72px">
              <img :src="getAvatarUrl(props.user)" alt="user">
            </q-avatar>
          </div>

          <div class="column q-ml-md text-left">
            <strong>{{ props.user['name'] }}</strong>
            <span class="text-grey-8">{{props.user['email'] }}</span>
            <div>
              <q-badge color="primary">{{ props.user['role'] }}</q-badge>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>

</template>

<script setup>
import {getAvatarUrl, humanDateTime} from "src/utils";
import {morph} from "quasar";
import {computed, ref} from "vue";

const props = defineProps({
  user: Object,
  action: String,
  date: String
});

const emit = defineEmits(['click'])

const toggle1 = ref(false)
const firstMorphRef = ref()
let cancel1

const props1 = computed(() => {
  return toggle1.value === true
    ? {
      class: 'q-ml-sm q-pa-md bg-orange text-white rounded-borders',
      style: 'font-size: 24px'
    }
    : {
      class: 'q-ml-xl q-px-xl q-py-lg bg-blue text-white',
      style: 'border-radius: 25% 0/50% 0; font-size: 36px'
    }
})

function morphContent1() {
    const onToggle = () => {
      toggle1.value = toggle1.value !== true
    }

    if (cancel1 === void 0 || cancel1() === false) {
      cancel1 = morph({
        from: firstMorphRef.value,
        onToggle,
        duration: 500,
        tween: true,
        onEnd: end => {
          end === 'from' && onToggle()
        }
      })
    }
}

const c1 = ref()
const c2 = ref()

const isShown = ref(false)


const props2 = computed(() => {
  return toggle1.value === true
    ? {
      class: 'cursor-pointer pog',
      style: ''
    }
    : {
      class: 'cursor-pointer',
      style: ''
    }
})

function click() {
  console.log('morph')
  const onToggle = () => {
    console.log(toggle1.value)
    toggle1.value = toggle1.value !== true
  }

  morph({
    from: c1.value.$el,
    onToggle,
    duration: 500,
    tween: true
  })
}
</script>

<style lang="scss" scoped>

.user-action-card {

}

.hog {
  display: none;
}

.pog .hog {
  display: block;
}

.pog .dog {
  display: none;
}

.dog {
  display: block;
}
</style>
