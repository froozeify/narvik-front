<script setup lang="ts">
import type {FormError} from '#ui/types'
import {useAppConfigStore} from "~/stores/useAppConfig";
import UserQuery from "~/composables/api/query/UserQuery";
import {isMobile, isTablet, watchBreakpoint} from "~/utils/browser";
import type {NuxtTurnstile} from "#components";

const toast = useToast()
const isLoading = ref(false)

const state = reactive({
  turnstileToken: undefined,
  email: undefined,
  password: undefined,
  securityCode: undefined,
})

const turnstile = ref<InstanceType<typeof NuxtTurnstile>>()
const requireTurnstile = useRuntimeConfig().public.clientTurnstile

const appConfigStore = useAppConfigStore();
const siteLogo: Ref<string> = appConfigStore.getLogo()

const userQuery = new UserQuery()

const isMobileDisplay = isMobile()
const isHorizontal = ref(false)
watchEffect(() => {
  isHorizontal.value = !isMobileDisplay.value
})

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
  const { error } = await userQuery.passwordReset(state.email, state.password, state.securityCode)
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

  if (requireTurnstile && !state.turnstileToken) {
    turnstile.value?.reset()
    return
  }

  isLoading.value = true
  const { error } = await userQuery.passwordResetInitialise(state.email, state.turnstileToken)
  isLoading.value = false
  turnstile.value?.reset()

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

onMounted(() => {
  watchBreakpoint()
  window.addEventListener('resize', watchBreakpoint)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', watchBreakpoint)
})
</script>

<template>
  <div>
    <div v-if="siteLogo" class="h-24 flex justify-center mb-4">
      <NuxtImg :src="siteLogo" class="h-full" />
    </div>

    <div>
      <UButton size="2xs" variant="link" to="/login" label="Se connecter" icon="i-heroicons-arrow-uturn-left" />
    </div>

    <UCard>

      <UTabs v-model="selected" :items="items" :orientation="isHorizontal ? 'horizontal' : 'vertical'">
        <template #item="{ item }">
          <div v-if="item.key === 'initial'">
            <UForm :state="state" class="space-y-4" @submit="initiatePasswordReset">
              <UFormField label="Email" name="email">
                <UInput v-model="state.email" type="email" />
              </UFormField>

              <NuxtTurnstile v-if="requireTurnstile" v-model="state.turnstileToken" />

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
              <UFormField label="Email" name="email">
                <UInput v-model.trim="state.email" type="email" />
              </UFormField>

              <UFormField label="Nouveau mot de passe" name="password">
                <UInput v-model="state.password" type="password" />
              </UFormField>

              <UFormField label="Code de sécurité" name="securityCode">
                <UInput v-model.trim="state.securityCode" />
              </UFormField>

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

<style lang="css" scoped>

</style>
