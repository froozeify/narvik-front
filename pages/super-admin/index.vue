<script lang="ts" setup>
  import MetricQuery from "~/composables/api/query/MetricQuery";
  import type {Metric} from "~/types/api/item/metric";

  import { Chart as ChartJS, Title, Tooltip, Legend, BarController, BarElement, CategoryScale, LinearScale, Colors } from 'chart.js'
  import { Bar } from 'vue-chartjs'


  definePageMeta({
    layout: "super-admin"
  });

</script>

<template>
  <div>
    <UCard>
      <div class="text-xl font-bold">TODO Super admin stats page</div>
    </UCard>
  </div>
</template>
