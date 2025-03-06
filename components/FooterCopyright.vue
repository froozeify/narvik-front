<script setup lang="ts">
  import {useAppConfigStore} from "~/stores/useAppConfig";

  const props = defineProps({
    displayVersion: {
      type: Boolean,
      default: true
    },
  })


  const runtimeConfig = useRuntimeConfig()
  const appConfigStore = useAppConfigStore()
</script>

<template>
  <div class="flex flex-row justify-center flex-wrap opacity-10 hover:opacity-30 gap-y-1 gap-x-4 text-xs print:hidden">
    <div class="basis-full text-center"><a href="https://about.narvik.app/" target="_blank">© Benoît VIGNAL</a></div>

    <template v-if="props.displayVersion">
      <a href="https://github.com/froozeify/narvik-front" target="_blank">Version {{ runtimeConfig.public.clientVersion }}</a>-
      <template v-if="appConfigStore.config && appConfigStore.config.appVersion">
        <a href="https://github.com/froozeify/narvik-back" target="_blank">Backend {{ appConfigStore.config.appVersion }}</a>-
      </template>
    </template>

    <a href="https://about.narvik.app/" target="_blank" class="underline">Narvik</a>
  </div>
</template>

<style scoped lang="scss">

</style>
