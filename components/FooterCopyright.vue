<script setup lang="ts">
  import {useAppConfigStore} from "~/stores/useAppConfig";

  const runtimeConfig = useRuntimeConfig()
  const appConfigStore = useAppConfigStore()
</script>

<template>
  <div class="flex flex-row justify-center flex-wrap opacity-10 hover:opacity-30 gap-y-1 gap-x-4 text-xs">
    <div class="basis-full text-center"><a href="https://github.com/froozeify" target="_blank">© Benoît VIGNAL</a></div>
    <a href="https://github.com/froozeify/narvik-front" target="_blank">Version {{ runtimeConfig.public.clientVersion }}</a>-
    <template v-if="appConfigStore.config && appConfigStore.config.appVersion">
      <a href="https://github.com/froozeify/narvik-back" target="_blank">Backend {{ appConfigStore.config.appVersion }}</a>-
    </template>
    <a href="https://narvik.pages.dev/" target="_blank" class="underline">Projet</a>
  </div>
</template>

<style scoped lang="scss">

</style>
