<script setup lang="ts">

import GlobalSettingQuery from "~/composables/api/query/GlobalSettingQuery";
import {
  GLOBAL_SETTINGS_SMTP_BOOLEAN_MAPPING,
  GLOBAL_SETTINGS_SMTP_STRING_MAPPING,
  type SmtpConfig
} from "~/types/api/smtp";
import type {FormError, FormErrorEvent} from "#ui/types";

definePageMeta({
  layout: "admin"
});

useHead({
  title: 'Configuration email'
})

const toast = useToast()
const isLoading = ref(false)

const globalSettingQuery = new GlobalSettingQuery();

const smtpSetting: Ref<SmtpConfig> = ref({});
const testEmail = ref('')
loadSmtpSettings()

async function loadSmtpSettings() {
  isLoading.value = true

  for (const [key, value] of Object.entries(GLOBAL_SETTINGS_SMTP_BOOLEAN_MAPPING)) {
    let {retrieved} = await globalSettingQuery.get(value)
    if (retrieved) {
      let setValue: boolean = false
      if (retrieved.value) {
        if (retrieved.value === '1' || retrieved.value.toLowerCase() === 'true') {
          setValue = true
        }
      }
      // @ts-ignore
      smtpSetting.value[key] = setValue
    }
  }

  for (const [key, value] of Object.entries(GLOBAL_SETTINGS_SMTP_STRING_MAPPING)) {
    let { retrieved } = await globalSettingQuery.get(value)
    if (retrieved) {
      let setValue: string|null = null
      if (retrieved.value) {
        setValue = retrieved.value
      }
      // @ts-ignore
      smtpSetting.value[key] = setValue
    }
  }

  isLoading.value = false
}

const validate = (state: any): FormError[] => {
  const errors = []
  if (!state.host) errors.push({ path: 'host', message: 'Champ requis' })
  if (!state.port) errors.push({ path: 'port', message: 'Champ requis' })
  if (!state.sender) errors.push({ path: 'sender', message: 'Champ requis' })
  return errors
}

async function onError(event: FormErrorEvent) {
  const element = document.getElementById(event.errors[0].id)
  element?.focus()
  element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

async function updateSmtpSetting() {
  isLoading.value = true
  const { item, error } = await globalSettingQuery.updateSmtpConfig(smtpSetting.value)
  isLoading.value = false

  if (error || !item) {
    toast.add({
      title: "Une erreur est survenue",
      color: "red"
    })
    return
  }

  toast.add({
    color: "green",
    title: "Configuration mise à jour"
  })

  await loadSmtpSettings()
}

async function testSmtp() {
  if (testEmail.value.trim().length < 5) {
    return
  }
  await globalSettingQuery.testSmtp(testEmail.value.trim())

  toast.add({
    color: "green",
    title: "Email envoyé"
  })
}

</script>

<template>
  <GenericLayoutContentWithStickySide mobile-side-title="Tester la configuration">
    <template #main>
      <UCard>
        <div class="text-xl font-bold mb-4">Configuration SMTP</div>

        <UButton
          color="blue"
          size="2xs"
          icon="i-heroicons-arrow-path"
          class="mb-4"
          :loading="isLoading"
          @click="loadSmtpSettings()"
        >
          Récupérer la configuration depuis le serveur
        </UButton>

        <UProgress v-if="isLoading" animation="swing" class="mb-2" />
        <UForm v-else class="flex gap-2 flex-col" :state="smtpSetting" :validate="validate" @submit="updateSmtpSetting" @error="onError">
          <UFormGroup label="Activé">
            <UToggle v-model="smtpSetting.on" />
          </UFormGroup>

          <UFormGroup label="Hôte" name="host">
            <UInput v-model="smtpSetting.host" />
          </UFormGroup>

          <UFormGroup label="Port" name="port">
            <UInput v-model="smtpSetting.port" />
          </UFormGroup>

          <UFormGroup label="Utilisateur" name="username">
            <UInput v-model="smtpSetting.username" />
          </UFormGroup>

          <UFormGroup label="Mot de passe" name="password">
            <UInput v-model="smtpSetting.password" type="password" />
          </UFormGroup>

          <UFormGroup label="Email expéditeur" name="sender">
            <UInput v-model="smtpSetting.sender" />
          </UFormGroup>

          <UFormGroup label="Nom expéditeur" name="senderName">
            <UInput v-model="smtpSetting.senderName" />
          </UFormGroup>

          <UButton
            type="submit"
            block
            class="mt-2"
            :loading="isLoading"
          >
            Modifier
          </UButton>
        </UForm>

      </UCard>
    </template>

    <template #side>
      <UCard>
        <div class="text-xl font-bold mb-4">Tester la configuration SMTP</div>
        <UFormGroup label="Adresse mail" name="testEmail">
          <UInput v-model="testEmail" type="email" />
        </UFormGroup>

        <UButton
          type="submit"
          block
          class="mt-4"
          :loading="isLoading"
          @click="testSmtp()"
        >
          Envoyer le mail
        </UButton>
      </UCard>
    </template>
  </GenericLayoutContentWithStickySide>
</template>


<style lang="scss" scoped>

</style>

