<script setup lang="ts">
import type {FormError, FormSubmitEvent} from '#ui/types'
import {useLoginUser} from "~/composables/api/api";
import type {Image} from "~/types/api/item/image";
import {useAppConfigStore} from "~/stores/useAppConfig";
import {useSelfMemberStore} from "~/stores/useSelfMember";

const toast = useToast()
const isLoading = ref(false)

const state = reactive({
  email: undefined,
  password: undefined
})

const appConfigStore = useAppConfigStore();
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
      title: error.statusCode === 401 ? "Erreur de connexion" : "Trop de tentative",
      description: error.statusCode === 401 ? 'Mauvais email/mot de passe' : 'Veuillez réessayer dans 15 minutes.'
    })
    console.error(error)
    isLoading.value = false
    return;
  }

  try {
    const selfStore = useSelfMemberStore();
    await selfStore.refresh();
  } catch (e) {
    toast.add({
      color: "red",
      title: "Erreur de connexion"
    })
    console.error(e)
    isLoading.value = false
    return;
  }

  isLoading.value = false
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
        <UFormGroup label="Email" name="email">
          <UInput v-model="state.email" type="email" />
        </UFormGroup>

        <UFormGroup label="Mot de passe" name="password">
          <UInput v-model="state.password" type="password" />
        </UFormGroup>

        <div class="flex justify-between">
          <UButton type="submit" :loading="isLoading">
            Connexion
          </UButton>

          <UButton v-if="notificationsModule && notificationsModule['enabled']" variant="ghost" @click="navigateTo('login/password-reset')">
            Mot de passe oublié
          </UButton>
        </div>
      </UForm>
    </UCard>
  </div>
</template>

<style lang="scss" scoped>

</style>
