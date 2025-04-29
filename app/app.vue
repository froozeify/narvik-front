<script setup lang="ts">
import ModalLegalsAcceptance from "~/components/Modal/ModalLegalsAcceptance";

const runtimeConfig = useRuntimeConfig()

if (runtimeConfig.public.umamiEnabled) {
  useScript({
    src: runtimeConfig.public.umamiScript as string,
    "data-website-id": runtimeConfig.public.umamiWebsiteId as string,
    defer: "true"
  })
}

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
