<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types'
import {useLoginUser} from "~/composables/api/api";

const state = reactive({
  email: undefined,
  password: undefined
})

async function onSubmit(event: FormSubmitEvent<{email: string, password: string}>) {
  try {
    await useLoginUser(event.data.email, event.data.password);
  } catch (e) {
    console.log("Login failed");
    return;
  }

  await navigateTo('/');
}
</script>

<template>
  <div>
    <UCard>
      <UForm :state="state" class="space-y-4" @submit="onSubmit">
        <UFormGroup label="Email" name="email">
          <UInput v-model="state.email" />
        </UFormGroup>

        <UFormGroup label="Mot de passe" name="password">
          <UInput v-model="state.password" type="password" />
        </UFormGroup>

        <UButton type="submit">
          Connexion
        </UButton>
      </UForm>
    </UCard>
  </div>
</template>

<style lang="scss" scoped>

</style>
