<template>
  <ChartJSBarChart
    class="relative h-full w-full"
    :chart-data="chartData"
    :chart-options="
      {
        responsive: true,
        maintainAspectRatio: false,
        resizeDelay: 100,
        layout: {
          padding: 30
        },
        scales: {
          x: {
            display: true
          },
          y: {
            display: false
          }
        },
        plugins: {
          tooltip: {
            enabled: false
          },
          datalabels: {
            display: true,
            font: {
              weight: 'bold'
            },
            labels: {
              value: {
                anchor: (context) =>
                  (context.dataset.data[context.dataIndex] ?? 0) > 0 ?
                    'end' :
                    'start',
                align: (context) =>
                  (context.dataset.data[context.dataIndex] ?? 0) > 0 ?
                    'end' :
                    'start',
                display: (context) =>
                  (context.dataset.data[context.dataIndex] ?? 0) !== 0,
                borderRadius: 4,
                padding: 6,
                formatter: (value) => NumberUtils.formatNumber(value, {})
              }
            }
          }
        }
      }
    "
  />
</template>

<script setup lang="ts">
  import { Bar as ChartJSBarChart } from 'vue-chartjs';
  import type { TChartData } from 'vue-chartjs/dist/types';

  import { computed, type PropType } from 'vue';

  import { Utils } from '../../utils/utils';
  import { NumberUtils } from '../../utils/numberUtils';

  export type DataItem = {
    label: string;
    value: number;
  };

  const props = defineProps({
    data: {
      type: Array as PropType<Array<DataItem>>,
      required: true
    }
  });

  const color = Utils.getValueOfCSSVar('--color-primary-element');

  const chartData = computed<TChartData<'bar'>>(() => ({
    labels: props.data.map((d) => d.label),
    datasets: [
      {
        data: props.data.map((d) => NumberUtils.roundToPrecision(d.value)),
        borderWidth: 2,
        borderColor: Utils.convertHexToRgba(color),
        backgroundColor: Utils.convertHexToRgba(color, 0.2)
      }
    ]
  }));
</script>
