<script lang="ts" setup>
  import MemberQuery from "~/composables/api/query/MemberQuery";
  import MetricQuery from "~/composables/api/query/MetricQuery";
  import type {Metric} from "~/types/metric";
  import GlobalSettingQuery from "~/composables/api/query/GlobalSettingQuery";
  import { formatDateReadable } from "~/utils/date";
  import MemberPresenceQuery from "~/composables/api/query/MemberPresenceQuery";

  definePageMeta({
    layout: "admin"
  });

  useHead({
    title: "Import itac club secondaire"
  })

  const toast = useToast()

  const fileUploading = ref(false)
  const state = reactive({
    file: undefined
  })

  const memberQuery = new MemberQuery()
  const memberPresenceQuery = new MemberPresenceQuery()
  const metricQuery = new MetricQuery()
  const globalSettingQuery = new GlobalSettingQuery();

  const importBatchesMetric: Ref<Metric | undefined> = ref(undefined)
  const lastImportDate: Ref<string | undefined> = ref(undefined)

  getMetrics();

  function getMetrics() {
    metricQuery.get("import-batches").then(value => {
      if (value.retrieved) {
        importBatchesMetric.value = value.retrieved
      }
    })

    globalSettingQuery.get('LAST_SECONDARY_CLUB_ITAC_IMPORT').then(value => {
      if (value.retrieved) {
        lastImportDate.value = value.retrieved.value
      }
    });
  }

  async function getFileObject(event) {
    const files = event.target.files || event.dataTransfer.files;

    if (files.length > 0) {
      fileUploading.value = true

      const formData = new FormData()
      formData.append('file', files.item(0), files.item(0).name)

      const { created, violations, error } = await memberQuery.importFromItacSecondary(formData)
      fileUploading.value = false

      if (error) {
        toast.add({
          title: "Erreur lors de l'envoie du fichier",
          description: error.message,
          color: "red"
        })
        return
      }

      getMetrics()

      toast.add({
        title: "Fichier envoyé",
        color: "green"
      })
    }
  }

  async function migrateExternal() {
    const { error } = await memberPresenceQuery.importFromExternalPresences()

    if (error) {
      toast.add({
        title: "Erreur lors de la migration",
        description: error.message,
        color: "red"
      })
      return
    }

    getMetrics()

    toast.add({
      title: "Présences migrées",
      color: "green"
    })
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

      <UButton target="_blank" to="https://narvik.pages.dev/frontend/docs/import/itac.html#import-des-membres-club-secondaire">Documentation</UButton>

      <UButton @click="migrateExternal()" color="green" class="mx-4" :disabled="(importBatchesMetric && importBatchesMetric.value > 0)">Migration présence externe vers présence membres</UButton>

    </UCard>

  </div>
</template>
