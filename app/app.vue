<script setup lang="ts">
import { useSelfUserStore } from "~/stores/useSelfUser";
import ModalLegalsAcceptance from "~/components/Modal/ModalLegalsAcceptance.vue";

const selfUser = useSelfUserStore()
if (!selfUser.isLegalsAccepted()) {
  useModal().open(ModalLegalsAcceptance, {
    preventClose: true
  })
}
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
    <UModals />
    <UNotifications />
  </NuxtLayout>
</template>
