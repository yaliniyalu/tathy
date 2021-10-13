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

const category = props.data.Approved.map(v => days[new Date(v.date).getDay()])

const options = computed(() => {
  return {
    tooltip: {
      trigger: 'axis'
    },
    title: {
      text: 'Items'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    legend: {
      data: ['Approved', 'Pending', 'Rejected'],
    },
    xAxis: {
      type: 'category',
      data: category,
      boundaryGap: false,
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: 'Approved',
        type: 'line',
        smooth: true,
        color: "#21ba45",
        data: props.data.Approved.map(v => v.count),
      },
      {
        name: 'Pending',
        type: 'line',
        smooth: true,
        color: "#f2c037",
        data: props.data.Pending.map(v => v.count),
      },
      {
        name: 'Rejected',
        type: 'line',
        smooth: true,
        color: "#c10015",
        data: props.data.Rejected.map(v => v.count),
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
