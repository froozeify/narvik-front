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
    title: "Import présences"
  })

  const toast = useToast()

  const apiUploadResponse: Ref<Object|undefined> = ref(undefined);
  const fileUploading = ref(false)
  const state = reactive({
    file: undefined
  })

  const memberPresenceQuery = new MemberPresenceQuery()


  async function getFileObject(event) {
    const files = event.target.files || event.dataTransfer.files;

    if (files.length > 0) {
      fileUploading.value = true

      const formData = new FormData()
      formData.append('file', files.item(0), files.item(0).name)

      const { created, violations, error } = await memberPresenceQuery.importFromCsv(formData)
      fileUploading.value = false

      if (error) {
        toast.add({
          title: "Erreur lors de l'envoie du fichier",
          description: error.message,
          color: "red"
        })
        return
      }

      apiUploadResponse.value = created

      toast.add({
        title: "Fichier envoyé",
        color: "green"
      })
    }
  }

</script>

<template>
  <div>


    <UCard>
      <p class="mt-4">L'import ce fait grâce au fichier csv exporté depuis l'historique de présence.</p>
      <p>Celui-ci doit obligatoirement être au format csv.</p>

      <p class="mt-4 mb-2">Example de csv possible</p>
      <pre class=" w-full text-xs inline-flex text-left items-center space-x-4 bg-gray-800 text-white rounded-lg p-4 overflow-x-auto whitespace-pre">
member.licence,date,activities.0.name,activities.1.name
01234578,2018-08-03T00:00:00+00:00,50M - Toutes armes,Non existant
45678412,2018-08-03T00:00:00+00:00,25M,
45678412,2018-08-04T00:00:00+00:00,50M - Toutes armes,
45671134,2018-08-03T00:00:00+00:00,Bureau,</pre>

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

      <pre v-if="apiUploadResponse" class="mb-4 w-full text-xs inline-flex text-left items-center space-x-4 bg-gray-800 text-white rounded-lg p-4 overflow-x-auto whitespace-pre">{{apiUploadResponse}}</pre>

      <UButton target="_blank" to="https://narvik.pages.dev/frontend/docs/import/itac.html#import-des-membres">Documentation</UButton>

    </UCard>

  </div>
</template>
