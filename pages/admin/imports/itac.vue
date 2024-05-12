<script lang="ts" setup>
  import MemberQuery from "~/composables/api/query/MemberQuery";
  import MetricQuery from "~/composables/api/query/MetricQuery";
  import type {Metric} from "~/types/metric";
  import GlobalSettingQuery from "~/composables/api/query/GlobalSettingQuery";
  import { formatDateReadable } from "~/utils/date";
  import {displayFileErrorToast, displayFileSuccessToast, getFileFormDataFromUInputChangeEvent} from "~/utils/file";

  definePageMeta({
    layout: "admin"
  });

  useHead({
    title: "Import itac"
  })

  const toast = useToast()

  const fileUploading = ref(false)
  const state = reactive({
    file: undefined
  })

  const memberQuery = new MemberQuery()
  const metricQuery = new MetricQuery()
  const globalSettingQuery = new GlobalSettingQuery();

  const importBatchesMetric: Ref<Metric | undefined> = ref(undefined)
  const lastImportDate: Ref<string | undefined> = ref(undefined)

  metricQuery.get("import-batches").then(value => {
    if (value.retrieved) {
      importBatchesMetric.value = value.retrieved
    }
  })

  globalSettingQuery.get('LAST_ITAC_IMPORT').then(value => {
    if (value.retrieved) {
      lastImportDate.value = value.retrieved.value
    }
  });

  async function getFileObject(event: any) {
    const formData = getFileFormDataFromUInputChangeEvent(event);

    if (!formData) {
      return;
    }

    fileUploading.value = true
    const {created, violations, error} = await memberQuery.importFromItac(formData)
    fileUploading.value = false

    if (error) {
      return displayFileErrorToast(error.message)
    }

    displayFileSuccessToast()
  }

</script>

<template>
  <div>

    <UAlert v-if="importBatchesMetric && importBatchesMetric.value > 0"
        class="mb-4"
        variant="subtle"
        icon="i-heroicons-exclamation-triangle"
        color="yellow"
        title="Des imports sont déjà en cours"
        :description="'Il y a ' + importBatchesMetric.value + ' batches d\'import en cours' "
      />

    <UCard>
      <UAlert v-if="lastImportDate && lastImportDate.length > 0"
              :title="'Dernier import effectué le ' + formatDateReadable(lastImportDate)"
              :color="new Date((new Date()).setMonth((new Date().getMonth() - 1))) > new Date(lastImportDate) ? 'red' : 'green' "
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
