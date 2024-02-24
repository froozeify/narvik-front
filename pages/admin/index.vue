<script lang="ts" setup>
  import MetricQuery from "~/composables/api/query/MetricQuery";
  import type {Metric} from "~/types/metric";

  import { Chart as ChartJS, Title, Tooltip, Legend, BarController, BarElement, CategoryScale, LinearScale, Colors } from 'chart.js'
  import {Bar} from 'vue-chartjs'
  ChartJS.register(Title, Tooltip, Legend, BarController, BarElement, CategoryScale, LinearScale, Colors)


  definePageMeta({
    layout: "admin"
  });

  const chartData: Ref<object|undefined> = ref(undefined)
  const chartOptions = ref({
    responsive: true,
    maintainAspectRatio: true,
  })

  const metricsQuery = new MetricQuery()

  const memberMetrics: Ref<Metric | undefined> = ref(undefined);
  // Will be updated once value return
  metricsQuery.get("members").then(value => {
    memberMetrics.value = value.retrieved
  });
  const memberStats = computed(() => {
    let response = {
      loading: true,
      currentSeason: 0,
      previousSeason: 0,
      isIncreasing: false
    }
    if (memberMetrics.value) {
      response.loading = false;
      memberMetrics.value.childMetrics.forEach(childMetric => {
        if (childMetric.name == "current-season") response.currentSeason = childMetric.value;
        if (childMetric.name == "previous-season") response.previousSeason = childMetric.value;
      })
      response.isIncreasing = response.currentSeason > response.previousSeason
    }
    return response
  });

  const presenceMetrics: Ref<Metric | undefined> = ref(undefined);
  metricsQuery.get("presences").then(value => {
    presenceMetrics.value = value.retrieved
  });

  const presenceStats = computed(() => {
    let response = {
      loading: true,
      currentYear: 0,
      currentYearOpenedDays: 0,
      ratioPresenceOpenCurrentYear: 0,

      previousYear: 0,
      previousYearOpenedDays: 0,
      ratioPresenceOpenPreviousYear: 0,
    }

    if (presenceMetrics.value) {
      response.loading = false;
      presenceMetrics.value.childMetrics.forEach(childMetric => {
        if (childMetric.name == "current-year") {
          response.currentYear = childMetric.value;
          response.currentYearOpenedDays = childMetric.childMetrics[0].value;
          response.ratioPresenceOpenCurrentYear = Math.round(response.currentYear/response.currentYearOpenedDays) || 0
        }
        if (childMetric.name == "previous-year") {
          response.previousYear = childMetric.value;
          response.previousYearOpenedDays = childMetric.childMetrics[0].value;
          response.ratioPresenceOpenPreviousYear = Math.round(response.previousYear/response.previousYearOpenedDays) || 0
        }
      })
    }

    return response
  });

  const externalPresenceMetrics: Ref<Metric | undefined> = ref(undefined);
  metricsQuery.get("external-presences").then(value => {
    externalPresenceMetrics.value = value.retrieved
  });

  const externalPresenceStats = computed(() => {
    let response = {
      loading: true,
      currentYear: 0,
      ratioPresenceOpenCurrentYear: 0,

      previousYear: 0,
      ratioPresenceOpenPreviousYear: 0,
    }

    if (externalPresenceMetrics.value) {
      response.loading = false;
      externalPresenceMetrics.value.childMetrics.forEach(childMetric => {
        if (childMetric.name == "current-year") {
          response.currentYear = childMetric.value;
          response.ratioPresenceOpenCurrentYear = Math.round(response.currentYear/presenceStats.value.currentYearOpenedDays) || 0
        }
        if (childMetric.name == "previous-year") {
          response.previousYear = childMetric.value;
          response.ratioPresenceOpenPreviousYear = Math.round(response.previousYear/presenceStats.value.previousYearOpenedDays) || 0
        }
      })
    }

    return response
  });

  metricsQuery.get('activities').then(value => {
    if (!value.retrieved || !value.retrieved.value) return;

    let datasets: any[] = [];

    let newChartData = {
      datasets: [{ }],
    }

    value.retrieved.childMetrics.forEach(cm => {
      let data: object[] = [];
      cm.childMetrics.forEach(ccm => {
        data.push({
          x: ccm.name,
          y: ccm.value
        })
      })

      const dataset = {
        'label': cm.name === 'previous-year' ? 'Année précédente' : 'Année courante',
        'data': data
      }

      datasets.push(dataset)
    })

    newChartData.datasets = datasets
    chartData.value = newChartData
  });

</script>

<template>
  <div>
    <div id="wrapper" class=" mx-auto">
      <div class="sm:grid sm:grid-flow-row sm:gap-4 sm:grid-cols-4">

        <StatCard
            title="Membres"
            tooltip="Cette saison"
            :value="memberStats.currentSeason"
            :is-increasing="memberStats.currentSeason > memberStats.previousSeason"
            :top-right="{
              tooltip: 'Saison précédente',
              value: memberStats.previousSeason,
            }"
            :loading="memberStats.loading">
        </StatCard>

        <StatCard
            title="Jours ouverts"
            tooltip="Cette année"
            :value="presenceStats.currentYearOpenedDays"
            :is-increasing="presenceStats.currentYearOpenedDays > presenceStats.previousYearOpenedDays"
            :top-right="{
              value: presenceStats.previousYearOpenedDays,
              tooltip: 'Année précédente (même date)'
            }"
            :loading="presenceStats.loading">
        </StatCard>

        <StatCard
            title="Présences (membres + externes)"
            tooltip="Cette année"
            :value="presenceStats.currentYear + externalPresenceStats.currentYear"
            :is-increasing="(presenceStats.currentYear + externalPresenceStats.currentYear) > (presenceStats.previousYear + externalPresenceStats.previousYear)"
            :top-right="{
              value: (presenceStats.previousYear + externalPresenceStats.previousYear),
              tooltip: 'Année précédente (même date)'
            }"
            :loading="presenceStats.loading && externalPresenceStats.loading">
        </StatCard>

        <StatCard
            title="Présences/ouvertures (membres + externes)"
            tooltip="Cette année"
            :value="'≃ ' + (presenceStats.ratioPresenceOpenCurrentYear + externalPresenceStats.ratioPresenceOpenCurrentYear)"
            :is-increasing="(presenceStats.ratioPresenceOpenCurrentYear + externalPresenceStats.ratioPresenceOpenCurrentYear) > (presenceStats.ratioPresenceOpenPreviousYear + externalPresenceStats.ratioPresenceOpenPreviousYear)"
            :top-right="{
              value: (presenceStats.ratioPresenceOpenPreviousYear + externalPresenceStats.ratioPresenceOpenPreviousYear),
              tooltip: 'Année précédente (même date)'
            }"
            :loading="presenceStats.loading">
        </StatCard>

        <StatCard
            title="Présences"
            tooltip="Cette année"
            :value="presenceStats.currentYear"
            :is-increasing="presenceStats.currentYear > presenceStats.previousYear"
            :top-right="{
              value: presenceStats.previousYear,
              tooltip: 'Année précédente (même date)'
            }"
            :loading="presenceStats.loading">
        </StatCard>

        <StatCard
            title="Présences/ouvertures"
            tooltip="Cette année"
            :value="'≃ ' + presenceStats.ratioPresenceOpenCurrentYear"
            :is-increasing="presenceStats.ratioPresenceOpenCurrentYear > presenceStats.ratioPresenceOpenPreviousYear"
            :top-right="{
              value: presenceStats.ratioPresenceOpenPreviousYear,
              tooltip: 'Année précédente (même date)'
            }"
            :loading="presenceStats.loading">
        </StatCard>

        <StatCard
            title="Présences externes"
            tooltip="Cette année"
            :value="externalPresenceStats.currentYear"
            :is-increasing="externalPresenceStats.currentYear > externalPresenceStats.previousYear"
            :top-right="{
              value: externalPresenceStats.previousYear,
              tooltip: 'Année précédente (même date)'
            }"
            :loading="externalPresenceStats.loading">
        </StatCard>

        <StatCard
            title="Présences externes/ouvertures"
            tooltip="Cette année"
            :value="'≃ ' + externalPresenceStats.ratioPresenceOpenCurrentYear"
            :is-increasing="externalPresenceStats.ratioPresenceOpenCurrentYear > externalPresenceStats.ratioPresenceOpenPreviousYear"
            :top-right="{
              value: externalPresenceStats.ratioPresenceOpenPreviousYear,
              tooltip: 'Année précédente (même date)'
            }"
            :loading="externalPresenceStats.loading">
        </StatCard>
      </div>

      <UCard v-if="chartData" class="mt-4">
        <div class="text-xl font-bold">Statistiques d'activités réalisées (membres)</div>
        <div class="my-4 text-sm">Les données sont basées sur la même période</div>
        <Bar
            :data="chartData"
            :options="chartOptions"
        />
      </UCard>
    </div>
  </div>
</template>
