<script lang="ts" setup>
  import MemberQuery from "~/composables/api/query/clubDependent/MemberQuery";
  import {displayFileErrorToast, displayFileSuccessToast, getFileFormDataFromUInputChangeEvent} from "~/utils/file";

  definePageMeta({
    layout: "admin"
  });

  useHead({
    title: "Import des photos"
  })

  const toast = useToast()
  const memberQuery = new MemberQuery()

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
    const {created, error} = await memberQuery.importPhotosFromItac(formData)
    fileUploading.value = false

    if (error) {
      return displayFileErrorToast(error.message)
    }

    displayFileSuccessToast()
  }

</script>

<template>
  <div>
    <UCard>
      <p>L'import ce fait grâce au zip généré par itac.</p>
      <p>Celui-ci doit obligatoirement être au format zip.</p>
      <p>Chaque image doit être nommé avec le numéro de licence de la personne.</p>

      <UInput
          :loading="fileUploading"
          :disabled="fileUploading"
          class="my-4"
          type="file"
          accept="application/zip"
          icon="i-heroicons-archive-box"
          @change="getFileObject"
      />

      <UButton target="_blank" to="https://docs.narvik.app/frontend/docs/import/fftir-itac.html#import-des-photos">Documentation</UButton>

    </UCard>
  </div>
</template>
