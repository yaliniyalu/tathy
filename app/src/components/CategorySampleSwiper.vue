<template>
  <div>
    <CategoryTitleLink :label="sample.name" :to="`/category/${sample._id}/packs?name=${sample.name}`"/>
    <swiper :breakpoints="breakpoints" :slides-per-view="3" :space-between="50" style="margin-right: 5px">
      <swiper-slide v-for="pack in sample.packs">
        <PackCard :pack="pack" />
      </swiper-slide>
    </swiper>
  </div>
</template>

<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import PackCard from "components/PackCard";
import CategoryTitleLink from "components/CategoryTitleLink";

const props = defineProps({
  sample: {
    type: Object,
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
