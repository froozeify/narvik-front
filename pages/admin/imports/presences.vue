<script lang="ts" setup>
  import MemberPresenceQuery from "~/composables/api/query/clubDependent/plugin/presence/MemberPresenceQuery";
  import {displayFileErrorToast, displayFileSuccessToast, getFileFormDataFromUInputChangeEvent} from "~/utils/file";
  import ExternalPresenceQuery from "~/composables/api/query/clubDependent/plugin/presence/ExternalPresenceQuery";

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
  const externalPresenceQuery = new ExternalPresenceQuery()

  async function importMemberPresences(event: any) {
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

  async function importExternalPresences(event: any) {
    const formData = getFileFormDataFromUInputChangeEvent(event);

    if (!formData) {
      return;
    }

    fileUploading.value = true
    const {created, error} = await externalPresenceQuery.importFromCsv(formData)
    fileUploading.value = false

    if (error) {
      return displayFileErrorToast(error.message)
    }

    apiUploadResponse.value = created
    displayFileSuccessToast()
  }

</script>

<template>
  <div class="flex flex-col gap-4">
    <MetricAdminImportBatches />

    <UAlert
      icon="i-heroicons-megaphone"
      color="orange"
      title="Veuillez-vous assurer que tous les membres sont bien importés avant."
      description="L'import ne créera pas de nouveaux membres ni activités."
    />

    <UCard>
      <p>L'import ce fait grâce au fichier csv exporté depuis l'historique de présence.</p>
      <p>Celui-ci doit obligatoirement être au format csv.</p>
      <p>Une fois le fichier envoyé, l'import est effectué en tâche de fond et peux prendre un certain temps.</p>

      <div class="grid grid-cols-11 my-4">
        <div class="col-span-5 space-y-2">
          <p class="font-bold">Membres</p>
          <UInput
            :loading="fileUploading"
            :disabled="fileUploading"
            class="my-4"
            type="file"
            accept="text/csv"
            icon="i-heroicons-document-text"
            v-model="state.file"
            @change="importMemberPresences"
          />

          <p class="">Example</p>

          <pre class=" w-full text-xs inline-flex text-left items-center space-x-4 bg-gray-800 text-white rounded-lg p-4 overflow-x-auto whitespace-pre">
member.licence,date,activities.0.name,activities.1.name
01234578,2018-08-03T00:00:00+00:00,50M - Toutes armes,Non existant
45678412,2018-08-03T00:00:00+00:00,25M,
45678412,2018-08-04T00:00:00+00:00,50M - Toutes armes,
45671134,2018-08-03T00:00:00+00:00,Bureau,</pre>
        </div>

        <UDivider class="col-span-1" orientation="vertical" />

        <div class="col-span-5 space-y-2">
          <p class="font-bold">Présences externe</p>
          <UInput
            :loading="fileUploading"
            :disabled="fileUploading"
            class="my-4"
            type="file"
            accept="text/csv"
            icon="i-heroicons-document-text"
            v-model="state.file"
            @change="importExternalPresences"
          />

          <p class="">Example</p>

          <pre class=" w-full text-xs inline-flex text-left items-center space-x-4 bg-gray-800 text-white rounded-lg p-4 overflow-x-auto whitespace-pre">
licence,firstname,lastname,date,activities.0.name,activities.1.name
01234578,Jean,NOM,2018-08-03T00:00:00+00:00,50M - Toutes armes,Non existant
,Jean,NOM2,2018-08-03T00:00:00+00:00,25M,
,Jean,NOM3,2018-08-04T00:00:00+00:00,50M - Toutes armes,
,Jean,NOM4,2018-08-03T00:00:00+00:00,Bureau,</pre>
        </div>
      </div>


      <pre v-if="apiUploadResponse" class="mb-4 w-full text-xs inline-flex text-left items-center space-x-4 bg-gray-800 text-white rounded-lg p-4 overflow-x-auto whitespace-pre">{{apiUploadResponse}}</pre>

      <div class="flex gap-2">
        <UButton target="_blank" to="https://docs.narvik.app/frontend/docs/import/narvik.html">Documentation</UButton>
        <div class="flex-1"></div>
        <UButton variant="ghost" to="/admin/imports/cerbere">Import depuis cerbère</UButton>
      </div>

    </UCard>

  </div>
</template>
