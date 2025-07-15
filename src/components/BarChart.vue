<template>
  <div ref="chartRef" style="width: 100%; height: 400px;"></div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from 'vue';
import * as echarts from 'echarts';

interface ChartDataItem {
  name: string;
  invoiced: number;
  paid: number;
  budget?: number;
}

export default defineComponent({
  name: 'BarChart',
  props: {
    chartData: {
      type: Array as () => ChartDataItem[],
      required: true
    },
    title: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const chartRef = ref<HTMLElement | null>(null);
    let chart: echarts.ECharts | null = null;

    const initChart = () => {
      if (chartRef.value) {
        chart = echarts.init(chartRef.value);
        updateChart();
      }
    };

    const updateChart = () => {
      if (!chart) return;

      const option = {
        title: {
          text: props.title,
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: ['Invoiced', 'Paid', 'Budget'],
          bottom: 0
        },
        xAxis: {
          type: 'category',
          data: props.chartData.map(item => item.name)
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: 'Invoiced',
            type: 'bar',
            data: props.chartData.map(item => item.invoiced),
            itemStyle: {
              color: '#8884d8'
            }
          },
          {
            name: 'Paid',
            type: 'bar',
            data: props.chartData.map(item => item.paid),
            itemStyle: {
              color: '#82ca9d'
            }
          },
          {
            name: 'Budget',
            type: 'bar',
            data: props.chartData.map(item => item.budget || 0),
            itemStyle: {
              color: '#82ca5d'
            }
          }
        ]
      };

      chart.setOption(option);
    };

    onMounted(() => {
      initChart();
    });

    watch(() => props.chartData, () => {
      updateChart();
    }, { deep: true });

    return {
      chartRef
    };
  }
});
</script>