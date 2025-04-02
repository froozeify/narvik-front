<script setup lang="ts">

import type {PropType} from "vue";
import type {Club} from "~/types/api/item/club";

const props = defineProps({
  item: {
    type: Object as PropType<Club>,
    required: true
  },
})

</script>

<template>
  <div class="flex justify-between flex-wrap">
    <span class="font-bold">Fonctionalités</span>
    <NuxtLink class="text-xs underline" to="https://about.narvik.app/" target="_blank">En savoir plus sur les fonctionalités disponibles</NuxtLink>
  </div>
  <UTable
    :columns="[
      {
        key: 'name',
        label: 'Nom',
        class: 'w-1/3'
      },
      {
        key: 'enabled',
        label: 'Souscrite'
      }
    ]"
    :rows="[
      {
        name: 'Gestion des membres',
        enabled: true
      },
      {
        name: 'Enregistrement des présences',
        enabled: true
      },
      {
        name: 'Ventes et gestion des stocks',
        enabled: props.item.salesEnabled
      }
    ]"
    >
    <template #enabled-data="{ row }">
      <USwitch :model-value="row.enabled" />
    </template>
  </UTable>
</template>

<style scoped lang="scss">

</style>
