<template>
  <q-card>
    <q-card-section>
      <ECharts class="chart" :option="options" />
    </q-card-section>
  </q-card>
</template>

<script setup>
import {computed} from "vue";
import ECharts from 'vue-echarts'

const props = defineProps({
  data: {
    type: Array,
    required: true
  }
});

const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const category = props.data.map(v => days[new Date(v.date).getDay()])
const series = props.data.map(v => v.count)

const options = computed(() => {
  return {
    title: {
      text: 'New Users'
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: category
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: series,
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
