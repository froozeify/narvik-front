<script setup lang="ts">

import GlobalSettingQuery from "~/composables/api/query/GlobalSettingQuery";
import dayjs from "dayjs";
import {displayApiError} from "~/utils/resource";
import {GlobalSettingPublicEnum} from "~/types/api/item/globalSetting";

definePageMeta({
  layout: "super-admin"
});

useHead({
  title: 'Configuration documents légaux'
})

const toast = useToast()
const isUploading = ref(false)

const popoverLegalsOpen = ref(false)

const legalsLastUpdate: Ref<Date|undefined> = ref(undefined)
const legalsCguLink: Ref<string|undefined> = ref(undefined)
const legalsCgvLink: Ref<string|undefined> = ref(undefined)
const legalsPrivacyLink: Ref<string|undefined> = ref(undefined)

const globalSettingQuery = new GlobalSettingQuery();

async function loadLegalsLastUpdate() {
  const { retrieved, error } = await globalSettingQuery.getPublic(GlobalSettingPublicEnum.LEGALS_LAST_UPDATE)
  if (error) {
    console.error(error)
  }
  if (retrieved) {
    legalsLastUpdate.value = retrieved.value ? dayjs(retrieved.value).toDate() : undefined
  }
}

async function loadLegalsCgu() {
  const { retrieved, error } = await globalSettingQuery.getPublic(GlobalSettingPublicEnum.LEGALS_CGU)
  if (error) {
    console.error(error)
  }
  if (retrieved) {
    legalsCguLink.value = retrieved.value
  }
}

async function loadLegalsCgv() {
  const { retrieved, error } = await globalSettingQuery.getPublic(GlobalSettingPublicEnum.LEGALS_CGV)
  if (error) {
    console.error(error)
  }
  if (retrieved) {
    legalsCgvLink.value = retrieved.value
  }
}

async function loadLegalsPrivacy() {
  const { retrieved, error } = await globalSettingQuery.getPublic(GlobalSettingPublicEnum.LEGALS_PRIVACY_POLICY)
  if (error) {
    console.error(error)
  }
  if (retrieved) {
    legalsPrivacyLink.value = retrieved.value
  }
}

async function loadLegals() {
  await Promise.all([
    loadLegalsLastUpdate(),
    loadLegalsCgu(),
    loadLegalsCgv(),
    loadLegalsPrivacy()
  ])

  await loadLegalsLastUpdate()
}

async function updateLegalsDate() {
  if (!legalsLastUpdate.value) {
    return
  }

  const { error } = await globalSettingQuery.updateLegals(legalsLastUpdate.value)
  if (error) {
    displayApiError(error)
  }
}

// Code run at page load
loadLegals()

</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <GenericCard title="Date de dernière mise à jour">
      <p class="text-xs mb-2">Utilisée pour afficher la modal de consentement à la connexion.</p>
      <UPopover v-model:open="popoverLegalsOpen">
        <UButton icon="i-heroicons-calendar-days-20-solid" :label="formatDateReadable(legalsLastUpdate?.toString()) || 'Choisir une date'" />

        <template #content>
          <div>
            <GenericDatePicker v-model="legalsLastUpdate" mode="date" @close="popoverLegalsOpen = false; updateLegalsDate()" />
          </div>
        </template>
      </UPopover>
    </GenericCard>
    <GenericCard title="Condition Générales de vente">
      <UInput
        :loading="isUploading"
        type="file"
        accept="application/pdf"
        icon="i-heroicons-document"
        @change="console.log('file')"
      />

      {{ legalsCgvLink }}

      <UButton class="mt-2">Afficher le pdf</UButton>
    </GenericCard>
    <GenericCard title="Condition d'Utilisation">
      {{ legalsCguLink }}
    </GenericCard>
    <GenericCard title="Politique de confidentialité">
      {{ legalsPrivacyLink }}
    </GenericCard>
  </div>
</template>


<style lang="css" scoped>

</style>

