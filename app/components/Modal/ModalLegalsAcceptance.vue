<script setup lang="ts">
import {useSelfUserStore} from "~/stores/useSelfUser";

const emit = defineEmits(['accepted', 'cancel'])

const runtimeConfig = useRuntimeConfig()
const selfStore = useSelfUserStore()
const { user } = storeToRefs(selfStore)
const isLoading = ref(false)

async function accept() {
  isLoading.value = true
  // TODO: Make api patch with the current day to flag as accepted

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
      <div class="text-right font-bold text-xs">Dernière mise à jour le {{ formatDate(runtimeConfig.public.legalsLastUpdate) }}</div>
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
