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
const siteLogo: Ref<Image|null> = appConfigStore.getLogo()

const validate = (state: any): FormError[] => {
  const errors = []
  if (!state.email) errors.push({ path: 'email', message: 'Champ requis' })
  if (!state.password) errors.push({ path: 'password', message: 'Champ requis' })
  return errors
}

async function onSubmit(event: FormSubmitEvent<{email: string, password: string}>) {
  isLoading.value = true

  try {
    await useLoginUser(event.data.email, event.data.password);
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
      <img :src="siteLogo.base64" class="h-full" />
    </div>

    <UCard>
      <UForm :state="state" class="space-y-4" :validate="validate" @submit="onSubmit">
        <UFormGroup label="Email" name="email">
          <UInput v-model="state.email" type="email" />
        </UFormGroup>

        <UFormGroup label="Mot de passe" name="password">
          <UInput v-model="state.password" type="password" />
        </UFormGroup>

        <UButton type="submit" :loading="isLoading">
          Connexion
        </UButton>
      </UForm>
    </UCard>
  </div>
</template>

<style lang="scss" scoped>

</style>
