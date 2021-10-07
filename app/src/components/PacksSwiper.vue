<template>
  <div>
    <b class="text-primary" v-if="title">{{ title }}</b>
    <swiper class="q-mt-md" :breakpoints="breakpoints">
      <swiper-slide v-for="pack in packs">
        <PackCard :pack="pack" />
      </swiper-slide>
    </swiper>
  </div>
</template>

<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import PackCard from "components/PackCard";

const props = defineProps({
  title: String,
  packs: {
    type: Array,
    required: true
  }
});

const breakpoints ={
  0: {
    slidesPerView: 2,
    spaceBetween: 10
  },
  320: {
    slidesPerView: 3,
    spaceBetween: 20
  },
  480: {
    slidesPerView: 4,
    spaceBetween: 30
  },
  640: {
    slidesPerView: 5,
    spaceBetween: 40
  }
}
</script>

<style lang="scss" scoped>

</style>
