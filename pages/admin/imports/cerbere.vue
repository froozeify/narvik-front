<script lang="ts" setup>
  import MemberPresenceQuery from "~/composables/api/query/clubDependent/plugin/presence/MemberPresenceQuery";
  import MetricQuery from "~/composables/api/query/MetricQuery";
  import type {Metric} from "~/types/api/item/metric";
  import {displayFileErrorToast, displayFileSuccessToast, getFileFormDataFromUInputChangeEvent} from "~/utils/file";

  definePageMeta({
    layout: "admin"
  });

  useHead({
    title: "Import des présences Cerbère"
  })

  const toast = useToast()
  const memberPresenceQuery = new MemberPresenceQuery()
  const metricQuery = new MetricQuery()

  const importBatchesMetric: Ref<Metric | undefined> = ref(undefined)
  metricQuery.get("import-batches").then(value => {
    if (value.retrieved) {
      importBatchesMetric.value = value.retrieved
    }
  })

  const fileUploading = ref(false)
  const state = reactive({
    file: undefined
  })

  async function getFileObject(event: any) {
    const formData = getFileFormDataFromUInputChangeEvent(event);

    if (!formData) {
      return;
    }

    fileUploading.value = true
    const {created, error} = await memberPresenceQuery.importFromCerbere(formData)
    fileUploading.value = false

    if (error) {
      return displayFileErrorToast(error.message)
    }

    displayFileSuccessToast()
  }

</script>

<template>
  <div>
    <MetricAdminImportBatches />

    <UCard>
      <UAlert
          icon="i-heroicons-megaphone"
          class="mb-4"
          title="L'import ne doit être fait qu'une fois l'import des membres effectué."
          description="Dans le cas contraire, les présences seront enregistrées comme externe."
          color="red"
      />

      <p>L'import ce fait grâce au xls généré par cerbère.</p>
      <p>Celui-ci doit obligatoirement être au format xls.</p>

      <UInput
          :loading="fileUploading"
          :disabled="fileUploading"
          class="my-4"
          type="file"
          accept="application/vnd.ms-excel"
          icon="i-heroicons-document-text"
          v-model="state.file"
          @change="getFileObject"
      />

      <UButton target="_blank" to="https://docs.narvik.app/frontend/docs/import/fftir-cerbere.html">Documentation</UButton>

    </UCard>
  </div>
</template>
