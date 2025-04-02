<script setup lang="ts">
import { useSelfUserStore } from "~/stores/useSelfUser";
import ModalLegalsAcceptance from "~/components/Modal/ModalLegalsAcceptance.vue";

const appConfig = useAppConfig()

const selfUser = useSelfUserStore()
if (!selfUser.isLegalsAccepted()) {
  useModal().open(ModalLegalsAcceptance, {
    preventClose: true
  })
}
</script>

<template>
  <UApp :toaster="appConfig.toaster">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
