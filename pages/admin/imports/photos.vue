<script lang="ts" setup>
  import MemberQuery from "~/composables/api/query/MemberQuery";

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

  async function getFileObject(event) {
    const files = event.target.files || event.dataTransfer.files;

    if (files.length > 0) {
      fileUploading.value = true

      const formData = new FormData()
      formData.append('file', files.item(0), files.item(0).name)

      const { created, violations, error } = await memberQuery.importPhotosFromItac(formData)
      fileUploading.value = false

      if (error) {
        toast.add({
          title: "Erreur lors de l'envoie du fichier",
          description: error.message,
          color: "red"
        })
        return
      }

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
