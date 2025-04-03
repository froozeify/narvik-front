<script setup lang="ts">
import ModalLegalsAcceptance from "~/components/Modal/ModalLegalsAcceptance";

const appConfig = useAppConfig()

const selfUser = useSelfUserStore()
if (!selfUser.isLegalsAccepted()) {
  useOverlay().create(ModalLegalsAcceptance).open()
}

</script>

<template>
  <UApp :toaster="appConfig.toaster">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
