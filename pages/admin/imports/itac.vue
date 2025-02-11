<script lang="ts" setup>
  import MemberQuery from "~/composables/api/query/clubDependent/MemberQuery";
  import MetricQuery from "~/composables/api/query/MetricQuery";
  import type {Metric} from "~/types/api/item/metric";
  import GlobalSettingQuery from "~/composables/api/query/GlobalSettingQuery";
  import { formatDateReadable } from "~/utils/date";
  import {displayFileErrorToast, displayFileSuccessToast, getFileFormDataFromUInputChangeEvent} from "~/utils/file";
  import {useSelfUserStore} from "~/stores/useSelfUser";
  import dayjs from "dayjs";

  definePageMeta({
    layout: "admin"
  });

  useHead({
    title: "Import itac"
  })

  const selfStore = useSelfUserStore()

  const fileUploading = ref(false)
  const state = reactive({
    file: undefined
  })

  const memberQuery = new MemberQuery()

  async function getFileObject(event: any) {
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
</script>

<template>
  <div>

    <MetricAdminImportBatches />

    <UCard>
      <UAlert v-if="selfStore.selectedProfile?.club.settings.itacImportDate"
              :title="'Dernier import effectué le ' + formatDateReadable(selfStore.selectedProfile.club.settings.itacImportDate.toString())"
              :color="dayjs(selfStore.selectedProfile.club.settings.itacImportDate).isBefore(dayjs().subtract(1, 'months')) ? 'red' : 'green' "
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

      <UButton target="_blank" to="https://narvik.pages.dev/frontend/docs/import/itac.html#import-des-membres">Documentation</UButton>

    </UCard>

  </div>
</template>
