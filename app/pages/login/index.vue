<script setup lang="ts">
import type {FormError, FormSubmitEvent} from '#ui/types'
import {useLoginUser} from "~/composables/api/api";
import type {Image} from "~/types/api/item/image";
import {useAppConfigStore} from "~/stores/useAppConfig";
import {useSelfUserStore} from "~/stores/useSelfUser";
import ModalLegalsAcceptance from "~/components/Modal/ModalLegalsAcceptance.vue";

const toast = useToast()
const isLoading = ref(false)

const state = reactive({
  email: undefined,
  password: undefined
})

const appConfigStore = useAppConfigStore();

const selfStore = useSelfUserStore();
const siteLogo: Ref<string> = appConfigStore.getLogo()
const notificationsModule = appConfigStore.getModuleConfig('notifications')

const validate = (state: any): FormError[] => {
  const errors = []
  if (!state.email) errors.push({ path: 'email', message: 'Champ requis' })
  if (!state.password) errors.push({ path: 'password', message: 'Champ requis' })
  return errors
}

async function onSubmit(event: FormSubmitEvent<{email: string, password: string}>) {
  isLoading.value = true

  const { error } = await useLoginUser(event.data.email, event.data.password);
  if (error) {
    toast.add({
      color: "red",
      title: error.statusCode === 400 ? "Erreur de connexion" : "Trop de tentative",
      description: error.statusCode === 400 ? 'Mauvais email/mot de passe' : 'Veuillez réessayer dans 5 minutes.'
    })
    console.error(error)
    isLoading.value = false
    return;
  }

  if (!selfStore.isLegalsAccepted()) {
    useModal().open(ModalLegalsAcceptance, {
      preventClose: true,
      onAccepted() {
        redirectSuccessLogin()
      },
      onCancel() {
        isLoading.value = false
      }
    })
  } else {
    redirectSuccessLogin()
  }
}

function redirectSuccessLogin() {
  if (selfStore.isSuperAdmin()) {
    navigateTo('/super-admin');
  }
  navigateTo('/');
}
</script>

<template>
  <div>
    <div v-if="siteLogo" class="h-24 flex justify-center mb-4">
      <NuxtImg :src="siteLogo" class="h-full" />
    </div>

    <UCard>
      <UForm :state="state" class="space-y-4" :validate="validate" @submit="onSubmit">
        <UFormField label="Email" name="email">
          <UInput v-model="state.email" type="email" />
        </UFormField>

        <UFormField label="Mot de passe" name="password">
          <UInput v-model="state.password" type="password" />
        </UFormField>

        <div class="flex justify-end !-mt-0 ">
          <UButton class="text-xs" v-if="notificationsModule && notificationsModule['enabled']" variant="link" @click="navigateTo('login/password-reset')">
            Mot de passe oublié
          </UButton>
        </div>

        <div class="flex flex-col justify-center gap-4">
          <UButton block type="submit" :loading="isLoading">
            Connexion
          </UButton>

          <USeparator label="Ou" />

          <UButton block :disabled="isLoading" variant="soft" to="login/register">
            S'enregistrer
          </UButton>
        </div>
      </UForm>
    </UCard>
  </div>
</template>

<style lang="css" scoped>

</style>
