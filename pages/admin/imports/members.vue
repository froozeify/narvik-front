<script lang="ts" setup>
  import MemberQuery from "~/composables/api/query/clubDependent/MemberQuery";
  import MetricQuery from "~/composables/api/query/MetricQuery";
  import type {Metric} from "~/types/api/item/metric";
  import GlobalSettingQuery from "~/composables/api/query/GlobalSettingQuery";
  import { formatDateReadable } from "~/utils/date";
  import {displayFileErrorToast, displayFileSuccessToast, getFileFormDataFromUInputChangeEvent} from "~/utils/file";
  import {useSelfUserStore} from "~/stores/useSelfUser";
  import dayjs from "dayjs";
  import MemberPresenceQuery from "~/composables/api/query/clubDependent/plugin/presence/MemberPresenceQuery";

  definePageMeta({
    layout: "admin"
  });

  useHead({
    title: "Import membres"
  })

  const selfStore = useSelfUserStore()

  const toast = useToast()

  const fileUploading = ref(false)
  const state = reactive({
    file: undefined
  })

  const memberQuery = new MemberQuery()
  const memberPresenceQuery = new MemberPresenceQuery()

  async function importFromItac(event: any) {
    const formData = getFileFormDataFromUInputChangeEvent(event);

    if (!formData) {
      return;
    }

    fileUploading.value = true
    const {created, error} = await memberQuery.importFromItac(formData)
    fileUploading.value = false

    if (error) {
      return displayFileErrorToast(error.message)
    }

    displayFileSuccessToast()
    selfStore.refreshSelectedClubSettings()
  }

  async function importFromItacSecondary(event: any) {
    const formData = getFileFormDataFromUInputChangeEvent(event);

    if (!formData) {
      return;
    }

    fileUploading.value = true
    const {created, error} = await memberQuery.importFromItacSecondary(formData)
    fileUploading.value = false

    if (error) {
      return displayFileErrorToast(error.message)
    }

    selfStore.refreshSelectedClubSettings()
    displayFileSuccessToast();
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

    selfStore.refreshSelectedClubSettings()

    toast.add({
      title: "Présences migrées",
      color: "green"
    })
  }

  async function importFromEden(event: any) {
    const formData = getFileFormDataFromUInputChangeEvent(event);

    if (!formData) {
      return;
    }

    fileUploading.value = true
    const {created, error} = await memberQuery.importFromEden(formData)
    fileUploading.value = false

    if (error) {
      return displayFileErrorToast(error.message)
    }

    displayFileSuccessToast();
  }
</script>

<template>
  <div>

    <MetricAdminImportBatches />

    <UCard>
      <p>L'import ce fait grâce au fichier généré par itac.</p>
      <p>Celui-ci doit obligatoirement être au format csv.</p>

      <div class="grid grid-cols-11 my-4">
        <div class="col-span-5 space-y-4">
          <p class="font-bold">Club principal</p>
          <UAlert v-if="selfStore.selectedProfile?.club.settings.itacImportDate"
                  :title="'Dernier import effectué le ' + formatDateReadable(selfStore.selectedProfile.club.settings.itacImportDate.toString())"
                  :color="dayjs(selfStore.selectedProfile.club.settings.itacImportDate).isBefore(dayjs().subtract(1, 'months')) ? 'red' : 'green' "
          />
          <UAlert v-else
                  title="Aucun import effectué"
                  color="red"
          />

          <UInput
            :loading="fileUploading"
            :disabled="fileUploading"
            type="file"
            accept="text/csv"
            icon="i-heroicons-document-text"
            v-model="state.file"
            @change="importFromItac"
          />
        </div>

        <UDivider class="col-span-1" orientation="vertical" />

        <div class="col-span-5 space-y-4">
          <p class="font-bold">Club secondaire</p>
          <UAlert v-if="selfStore.selectedProfile?.club.settings.itacSecondaryImportDate"
                  :title="'Dernier import effectué le ' + formatDateReadable(selfStore.selectedProfile.club.settings.itacSecondaryImportDate.toString())"
                  :color="dayjs(selfStore.selectedProfile.club.settings.itacSecondaryImportDate).isBefore(dayjs().subtract(1, 'months')) ? 'red' : 'green' "
          />
          <UAlert v-else
                  title="Aucun import effectué"
                  color="red"
          />

          <UInput
            :loading="fileUploading"
            :disabled="fileUploading"
            type="file"
            accept="text/csv"
            icon="i-heroicons-document-text"
            v-model="state.file"
            @change="importFromItacSecondary"
          />
        </div>
      </div>

      <div class="flex gap-2">
        <UButton target="_blank" to="https://docs.narvik.app/frontend/docs/import/itac.html#import-des-membres">Documentation</UButton>
        <div class="flex-1"></div>
        <UButton @click="migrateExternal()" variant="ghost" color="green" :disabled="((selfStore.selectedProfile?.club.settings.itacSecondaryImportRemaining && selfStore.selectedProfile.club.settings.itacSecondaryImportRemaining) ?? 0) > 0">Migration présence externe vers présence membres</UButton>
      </div>

    </UCard>


    <UCard class="my-4">
      <p class="font-bold">Certificat médicaux</p>
      <p>Pour le moment itac n'exporte pas la date de validité du certificat médical.</p>
      <p>Pour ce faire vous devais télécharger le fichier excel fourni par eden.</p>

      <UInput
        class="my-2"
        :loading="fileUploading"
        :disabled="fileUploading"
        type="file"
        accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        icon="i-heroicons-document-text"
        v-model="state.file"
        @change="importFromEden"
      />

      <p class="my-2">Exemple</p>

      <pre class=" w-full text-xs inline-flex text-left items-center space-x-4 bg-gray-800 text-white rounded-lg p-4 overflow-x-auto whitespace-pre">
N° licence | Date d'expiration
01234578   | 11.11.2024</pre>

      <div class="flex gap-2 mt-4">
        <UButton target="_blank" to="https://docs.narvik.app/frontend/docs/import/eden.html#import-des-certificats-medicaux">Documentation</UButton>
        <div class="flex-1"></div>
      </div>
    </UCard>

  </div>
</template>
