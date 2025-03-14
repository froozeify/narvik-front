<script setup lang="ts">
  import {useAppConfigStore} from "~/stores/useAppConfig";
  import dayjs from "dayjs";

  const props = defineProps({
    displayVersion: {
      type: Boolean,
      default: true
    },
  })


  const runtimeConfig = useRuntimeConfig()
  const appConfigStore = useAppConfigStore()

  interface externalLink {
    label: string,
    to: string,
  }

  const versions: externalLink[] = [
    {
      label: `Version ${runtimeConfig.public.clientVersion}`,
      to: 'https://github.com/froozeify/narvik-front'
    }
  ]
  if (appConfigStore.config?.appVersion) {
    versions.push({
      label: `Backend ${appConfigStore.config.appVersion}`,
      to: 'https://github.com/froozeify/narvik-back'
    })
  }

  const externalLinks: externalLink[] = [
    {
      label: 'Documentation',
      to: 'https://docs.narvik.app/frontend/'
    }
  ]
</script>

<template>
  <div class="transition flex flex-row justify-center flex-wrap opacity-10 hover:opacity-30 gap-y-1 gap-x-4 text-xs print:hidden">
    <div class="basis-full flex flex-wrap justify-center gap-2">
      <template v-for="(val, index) in externalLinks">
        <span v-if="index !== 0"> - </span>
        <NuxtLink :to="val.to" target="_blank" >{{ val.label }}</NuxtLink>
      </template>
    </div>

    <div v-if="props.displayVersion" class="basis-full flex flex-wrap justify-center gap-2">
      <template v-for="(val, index) in versions">
        <span v-if="index !== 0"> - </span>
        <NuxtLink :to="val.to" target="_blank" >{{ val.label }}</NuxtLink>
      </template>
    </div>

    <a href="https://about.narvik.app/" target="_blank" class="basis-full flex flex-wrap justify-center gap-2">
      <span class="underline">À propos de Narvik</span> -
      <span >© 2024 - {{ dayjs().year() }}. Tous droits réservés</span>
    </a>

  </div>
</template>

<style scoped lang="scss">

</style>
