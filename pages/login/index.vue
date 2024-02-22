<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types'
import {useLoginUser} from "~/composables/api/api";
import {useSelfMemberStore} from "~/stores/useSelfMember";
import type {Image} from "~/types/image";

const toast = useToast()
const isLoading = ref(false)

const state = reactive({
  email: undefined,
  password: undefined
})

const selfStore = useSelfMemberStore();
const siteLogo: Ref<Image|null> = selfStore.getSiteLogo()

async function onSubmit(event: FormSubmitEvent<{email: string, password: string}>) {
  isLoading.value = true

  try {
    await useLoginUser(event.data.email, event.data.password);
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
      <UForm :state="state" class="space-y-4" @submit="onSubmit">
        <UFormGroup label="Email" name="email">
          <UInput v-model="state.email" />
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
