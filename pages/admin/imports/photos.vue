<script lang="ts" setup>
  import MemberQuery from "~/composables/api/query/MemberQuery";
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

      <UInput
          :loading="fileUploading"
          :disabled="fileUploading"
          class="my-4"
          type="file"
          accept="application/zip"
          icon="i-heroicons-archive-box"
          v-model="state.file"
          @change="getFileObject"
      />

      <UButton target="_blank" to="https://narvik.pages.dev/frontend/docs/import/itac.html#import-des-photos">Documentation</UButton>

    </UCard>
  </div>
</template>
