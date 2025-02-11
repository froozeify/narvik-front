<script lang="ts" setup>
  import MemberQuery from "~/composables/api/query/clubDependent/MemberQuery";
  import MetricQuery from "~/composables/api/query/MetricQuery";
  import type {Metric} from "~/types/api/item/metric";
  import GlobalSettingQuery from "~/composables/api/query/GlobalSettingQuery";
  import { formatDateReadable } from "~/utils/date";
  import {displayFileErrorToast, displayFileSuccessToast, getFileFormDataFromUInputChangeEvent} from "~/utils/file";
  import {useSelfUserStore} from "~/stores/useSelfUser";
  import dayjs from "dayjs";

  definePageMeta({
    layout: "admin"
  });

  useHead({
    title: "Import itac"
  })

  const selfStore =  useSelfUserStore()
  const { selectedProfile } = useSelfUserStore()

  const fileUploading = ref(false)
  const state = reactive({
    file: undefined
  })

  const memberQuery = new MemberQuery()

  const importBatchesMetric: Ref<number | undefined> = ref(undefined)
  const lastImportDate: Ref<Date | undefined> = ref(undefined)

  async function getFileObject(event: any) {
    const formData = getFileFormDataFromUInputChangeEvent(event);

    if (!formData) {
      return;
    }

    fileUploading.value = true
    const {created, error} = await memberQuery.importFromItac(formData)
    fileUploading.value = false

    if (error) {
      return displayFileErrorToast(error.message)
    }

    displayFileSuccessToast()
    refreshMetrics()
  }

  function refreshMetrics() {
    selfStore.refreshSelectedClub()
    importBatchesMetric.value = selectedProfile?.club.settings.itacImportRemaining
    lastImportDate.value = selectedProfile?.club.settings.itacImportDate
  }

  let refreshInterval: NodeJS.Timeout
  refreshMetrics()
  onMounted(() => {
      refreshInterval = setInterval(() => {
        refreshMetrics()
      }, 5000)
  })

  onUnmounted(() => {
    if (refreshInterval) {
      clearInterval(refreshInterval)
    }
  })
</script>

<template>
  <div>

    <UAlert v-if="importBatchesMetric && importBatchesMetric > 0"
        class="mb-4"
        variant="subtle"
        icon="i-heroicons-exclamation-triangle"
        color="yellow"
        title="Des imports sont déjà en cours"
        :description="'Il y a ' + importBatchesMetric + ' batches d\'import en cours' "
      />

    <UCard>
      <UAlert v-if="lastImportDate"
              :title="'Dernier import effectué le ' + formatDateReadable(lastImportDate.toString())"
              :color="dayjs(lastImportDate).isBefore(dayjs().subtract(1, 'months')) ? 'red' : 'green' "
      />
      <UAlert v-else
              title="Aucun import effectué"
              color="red"
      />

      <p class="mt-4">L'import ce fait grâce au fichier généré par itac.</p>
      <p>Celui-ci doit obligatoirement être au format csv.</p>

      <UInput
        :loading="fileUploading"
        :disabled="fileUploading"
        class="my-4"
        type="file"
        accept="text/csv"
        icon="i-heroicons-document-text"
        v-model="state.file"
        @change="getFileObject"
      />

      <UButton target="_blank" to="https://narvik.pages.dev/frontend/docs/import/itac.html#import-des-membres">Documentation</UButton>

    </UCard>

  </div>
</template>
