<script lang="ts" setup>
  import MemberPresenceQuery from "~/composables/api/query/MemberPresenceQuery";
  import MetricQuery from "~/composables/api/query/MetricQuery";
  import type {Metric} from "~/types/metric";

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

  async function getFileObject(event) {
    const files = event.target.files || event.dataTransfer.files;

    if (files.length > 0) {
      fileUploading.value = true

      const formData = new FormData()
      formData.append('file', files.item(0), files.item(0).name)

      const { created, violations, error } = await memberPresenceQuery.importFromCerbere(formData)

      if (created) {
        toast.add({
          title: "Fichier envoyé",
          color: "green"
        })
      } else {
        toast.add({
          title: "Erreur lors de l'envoie du fichier",
          description: error,
          color: "red"
        })
      }

      fileUploading.value = false
    }
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
      <UAlert
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

      <UButton target="_blank" to="https://narvik.pages.dev/frontend/docs/import/cerbère.html">Documentation</UButton>

    </UCard>
  </div>
</template>
