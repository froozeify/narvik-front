<script setup lang="ts">
import {useSelfUserStore} from "~/stores/useSelfUser";
import UserQuery from "~/composables/api/query/UserQuery";

const emit = defineEmits(['accepted', 'cancel'])

const toast = useToast();
const runtimeConfig = useRuntimeConfig()
const selfStore = useSelfUserStore()
const isLoading = ref(false)

async function accept() {
  const userQuery = new UserQuery()

  isLoading.value = true
  const { error } = await userQuery.selfLegalsAccepted()

  if (error) {
    toast.add({
      color: "red",
      title: "L'enregistrement a échoué",
      description: error?.message
    });

    isLoading.value = false
    return
  }

  await selfStore.refresh()

  isLoading.value = false
  emit('accepted')
  await useModal().close()
}

</script>

<template>
  <ModalWithActions title="Mise à jour des conditions légales">
    <slot>
      <div>
        Merci de bien vouloir lire et accepter les <ULink class="underline" target="_blank" to="https://about.narvik.app/cgv">Conditions Générales de Vente</ULink>, la <ULink class="underline" target="_blank" to="https://about.narvik.app/rgpd">Politique de confidentialité</ULink> ainsi que les <ULink class="underline" target="_blank" to="https://about.narvik.app/cgu">Conditions Générales d’Utilisation</ULink> (CGU).
      </div>
    </slot>

    <template #cancel>
      <UButton color="red" variant="ghost" @click="useModal().close(); selfStore.logout(); emit('cancel')">
        Refuser et se déconnecter
      </UButton>
    </template>

    <template #actions>
      <UButton
        :loading="isLoading"
        @click="accept"
        color="green"
      >
        Accepter
      </UButton>
    </template>
  </ModalWithActions>
</template>

<style scoped lang="scss">

</style>
