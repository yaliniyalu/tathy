<template>
  <q-card flat :class="['bg-' + color, 'text-white', 'info-tile']">
    <q-card-section class="flex justify-between">
      <div>
        <p class="text-bold text-uppercase">{{ title }}</p>
        <p class="text-h5">{{ value }}</p>
<!--        <p :class="['diff', 'text-' + diff.type]"><q-icon v-if="diffIcon()" :name="diffIcon()"/> {{ diff.value | price(1) | withSign(true) }}%</p>-->
      </div>
      <div>
        <q-icon class="icon" :name="icon"/>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>

const props = defineProps({
  title: { type: String, required: true },
  value: { type: [String, Number], required: true },
  icon: { type: String, required: true },
  color: { type: String, required: true }
})


</script>

<style lang="scss" scoped>
p {
  margin: 0;
}

.value {

}

.icon {
  font-size: 45px;
}

.info-tile {
  .icon {
    transition: transform 0.5s;
  }

  &:hover {
    .icon {
      transform: rotate(-20deg) scale(1.6);
    }
  }
}
</style>
