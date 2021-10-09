<template>
<q-card>
  <q-card-section>
    Items
  </q-card-section>
  <q-separator/>
  <q-card-section>
    <ECharts class="chart" :option="options" />
  </q-card-section>
</q-card>
</template>

<script setup>
import {computed} from "vue";
import ECharts from 'vue-echarts'

const options = computed(() => {
  return {
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: [0, 0, 0, 0, 0, 0, 0],
        type: 'line',
        smooth: true
      }
    ]
  }
})
</script>

<style lang="scss" scoped>
.chart {
  height: 400px;
  width: 100%;
}
</style>
