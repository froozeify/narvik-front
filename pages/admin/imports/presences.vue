<script lang="ts" setup>
  import MemberPresenceQuery from "~/composables/api/query/clubDependent/plugin/presence/MemberPresenceQuery";
  import {displayFileErrorToast, displayFileSuccessToast, getFileFormDataFromUInputChangeEvent} from "~/utils/file";

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


  async function getFileObject(event: any) {
    const formData = getFileFormDataFromUInputChangeEvent(event);

    if (!formData) {
      return;
    }

    fileUploading.value = true
    const {created, error} = await memberPresenceQuery.importFromCsv(formData)
    fileUploading.value = false

    if (error) {
      return displayFileErrorToast(error.message)
    }

    apiUploadResponse.value = created
    displayFileSuccessToast()
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

      <UButton target="_blank" to="https://narvik.pages.dev/frontend/docs/import/narvik.html">Documentation</UButton>

    </UCard>

  </div>
</template>
