<script setup lang="ts">
import type {FormError} from '#ui/types'
import type {Image} from "~/types/api/item/image";
import {useAppConfigStore} from "~/stores/useAppConfig";
import MemberQuery from "~/composables/api/query/MemberQuery";

const toast = useToast()
const isLoading = ref(false)

const state = reactive({
  email: undefined,
  password: undefined,
  securityCode: undefined,
})

const appConfigStore = useAppConfigStore();
const siteLogo: Ref<Image|null> = appConfigStore.getLogo()

const memberQuery = new MemberQuery()

const selected = ref(0)
const items = [{
  key: 'initial',
  label: 'Demande de réinitialisation',
  icon: 'i-heroicons-lock-closed',
}, {
  key: 'reset',
  label: 'Vérification et modification',
  icon: 'i-heroicons-envelope-open',
}]

const validate = (state: any): FormError[] => {
  const errors = []
  if (!state.email) errors.push({ path: 'email', message: 'Champ requis' })
  if (!state.password || state.password.length < 8) errors.push({ path: 'password', message: 'Champ requis (8 caractères minimum)' })
  if (!state.securityCode) errors.push({ path: 'securityCode', message: 'Champ requis' })
  return errors
}

async function resetPassword() {
  if (!state.email || !state.password || !state.securityCode) {
    return
  }

  isLoading.value = true
  const { error } = await memberQuery.passwordReset(state.email, state.password, state.securityCode)
  isLoading.value = false

  if (error) {
    toast.add({
      color: "red",
      title: "Impossible d'effectuer la modification du mot de passe. Le mot de passe ou le code est incorrect.",
    });
    return;
  }

  toast.add({
    color: "green",
    title: "Le mot de passe a été modifié avec succès",
  });

  navigateTo('/login');
}

async function initiatePasswordReset() {
  if (!state.email) {
    return
  }

  isLoading.value = true
  const { error } = await memberQuery.passwordResetInitialise(state.email)
  isLoading.value = false

  if (error) {
    toast.add({
      color: "red",
      title: "Impossible d'effectuer la demande de réinitialisation.",
      description: "Compte non trouvé ou bloqué. Veuillez réessayer dans 24h."
    });
    return;
  }

  toast.add({
    color: "green",
    title: "Un code vérification à été envoyé par email",
  });

  selected.value = 1
}
</script>

<template>
  <div>
    <div v-if="siteLogo" class="h-24 flex justify-center mb-4">
      <img :src="siteLogo.base64" class="h-full" />
    </div>

    <UCard>

      <UTabs v-model="selected" :items="items">
        <template #item="{ item }">
          <div v-if="item.key === 'initial'">
            <UForm :state="state" class="space-y-4" @submit="initiatePasswordReset">
              <UFormGroup label="Email" name="email">
                <UInput v-model="state.email" type="email" />
              </UFormGroup>

              <UButton type="submit" :loading="isLoading">
                Valider
              </UButton>
            </UForm>
          </div>
          <div v-else>
            <UAlert
              icon="i-heroicons-megaphone"
              color="yellow"
              variant="soft"
              title="En cas d'erreur un nouveau code de sécurité sera envoyé."
              description="Seul le dernier code de sécurité reçu est valide."
            />
            <UForm :state="state" class="space-y-4 mt-4" :validate="validate" @submit="resetPassword">
              <UFormGroup label="Email" name="email">
                <UInput v-model.trim="state.email" type="email" />
              </UFormGroup>

              <UFormGroup label="Nouveau mot de passe" name="password">
                <UInput v-model="state.password" type="password" />
              </UFormGroup>

              <UFormGroup label="Code de sécurité" name="securityCode">
                <UInput v-model.trim="state.securityCode" />
              </UFormGroup>

              <div class="flex justify-between">
                <UButton type="submit" :loading="isLoading">
                  Modifier
                </UButton>
              </div>
            </UForm>
          </div>
        </template>
      </UTabs>
    </UCard>
  </div>
</template>

<style lang="scss" scoped>

</style>
