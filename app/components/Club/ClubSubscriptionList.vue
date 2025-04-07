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
        accessorKey: 'name',
        header: 'Nom',
        meta: {
          class: {
            th: 'w-1/3',
          }
        }
      },
      {
        accessorKey: 'enabled',
        header: 'Souscrite'
      }
    ]"
    :data="[
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
    <template #enabled-cell="{ row }">
      <USwitch class="pointer-events-none" v-model="row.original.enabled" />
    </template>
  </UTable>
</template>

<style scoped lang="css">

</style>
