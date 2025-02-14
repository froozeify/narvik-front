<script lang="ts" setup>
  import MemberQuery from "~/composables/api/query/clubDependent/MemberQuery";
  import {displayFileErrorToast, displayFileSuccessToast, getFileFormDataFromUInputChangeEvent} from "~/utils/file";
  import SaleQuery from "~/composables/api/query/clubDependent/plugin/sale/SaleQuery";

  definePageMeta({
    layout: "pos"
  });

  useHead({
    title: "Import des ventes"
  })

  const saleQuery = new SaleQuery()

  const apiUploadResponse: Ref<Object|undefined> = ref(undefined);
  const fileUploading = ref(false)
  const state = reactive({
    file: undefined
  })

  async function importFromCsv(event: any) {
    const formData = getFileFormDataFromUInputChangeEvent(event);

    if (!formData) {
      return;
    }

    fileUploading.value = true
    const {created, error} = await saleQuery.importFromCsv(formData)
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
    <UAlert
      icon="i-heroicons-megaphone"
      color="orange"
      title="Import statique."
      description="Les ventes importées ne seront pas liées avec les produits de l'inventaire."
    />

    <UCard>

      <p>L'import ce fait grâce au fichier csv exporté depuis l'historique des ventes.</p>
      <p>Celui-ci doit obligatoirement être au format csv.</p>

      <UInput
          :loading="fileUploading"
          :disabled="fileUploading"
          class="my-4"
          type="file"
          accept="text/csv"
          icon="i-heroicons-document-text"
          v-model="state.file"
          @change="importFromCsv"
      />

      <p class="">Example</p>

      <pre class=" w-full text-xs inline-flex text-left items-center space-x-4 bg-gray-800 text-white rounded-lg p-4 overflow-x-auto whitespace-pre">
seller.licence,paymentMode.name,price,comment,item.0.name,item.0.category,item.0.price,item.0.quantity,uuid,createdAt
31394762,Espèces,14.31,test,"Cible C50",Cibles,14.31,1,01950394-b472-7135-beb6-f138d91d624c,2025-02-14T08:30:32+00:00</pre>

      <pre v-if="apiUploadResponse" class="w-full text-xs inline-flex text-left items-center space-x-4 bg-gray-800 text-white rounded-lg p-4 overflow-x-auto whitespace-pre">{{apiUploadResponse}}</pre>

      <UButton class="mt-4" target="_blank" to="https://narvik.pages.dev/frontend/docs/import">Documentation</UButton>

    </UCard>
  </div>
</template>
