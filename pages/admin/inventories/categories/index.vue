<script setup lang="ts">
  import {formatDateReadable} from "~/utils/date";
  import type {ExternalPresence} from "~/types/externalpresence";

  definePageMeta({
    layout: "pos"
  });

  useHead({
    title: 'Catégorie d\'inventaire'
  })

  const selectedCategory: Ref<{id: number, weight: number, name: string} | null> = ref(null)

  const categories = ref([
    {
      id: 1,
      weight: 1,
      name: 'Categorie 1'
    },
    {
      id: 2,
      weight: 3,
      name: 'Categorie w3',
    },
    {
      id: 3,
      weight: 2,
      name: 'Categorie w2',
    }
  ])

  function rowClicked(row: object) {
    selectedCategory.value = row
  }

  function move(row: any, modifier: number) {
    // TODO: Change this for api call (so they are all moved cleanly in bo)
    // row.weight += modifier

    const sortedCategories = categories.value.sort((a, b) => (a.weight > b.weight ? 1 : -1))
    const matchToExchange = sortedCategories.find( value => value.weight == row.weight + modifier )

    if (!matchToExchange) return;

    matchToExchange.weight = row.weight
    row.weight += modifier
  }

</script>

<template>
  <div class="flex flex-col-reverse lg:flex-row gap-4">
    <UCard class="lg:w-2/3 shrink-0">
      <div class="flex flex-col flex-wrap">
        <div v-for="(category, index) in categories.sort((a, b) => (a.weight > b.weight ? 1 : -1))"
             class="flex-1 flex gap-4 cursor-pointer hover:bg-white dark:hover:bg-gray-800/50 transition-all px-1 py-2 rounded-md items-center"
             @click="rowClicked(category)"
        >
          <div class="flex-1">{{ category.name }}</div>


          <!-- Actions -->
          <div class="text-xs flex flex-col gap-0.5">
            <div v-if="index != 0" class="p-0.5 rounded-md text-primary-500 dark:text-primary-400 bg-primary-50 hover:bg-primary-100 dark:bg-primary-950 dark:hover:bg-primary-900 flex justify-center items-center">
              <UIcon name="i-heroicons-chevron-up" @click.stop="move(category, -1)"/>
            </div>
            <div v-if="index != categories.length - 1" class="p-0.5 rounded-md text-primary-500 dark:text-primary-400 bg-primary-50 hover:bg-primary-100 dark:bg-primary-950 dark:hover:bg-primary-900 flex justify-center items-center">
              <UIcon name="i-heroicons-chevron-down" @click.stop="move(category, 1)"/>
            </div>
          </div>
        </div>
      </div>
    </UCard>

    <div v-if="selectedCategory" class="w-full h-fit lg:sticky lg:top-20 max-h-[calc(100vh-6rem)] flex flex-col gap-4">
      <UCard class="overflow-y-auto">
        Afficher info / edit au clic ici
        <pre>{{ selectedCategory }}</pre>

      </UCard>

      <UButton block>Enregistrer</UButton>
      <UButton color="red" block>Supprimer</UButton>
    </div>

  </div>
</template>

<style scoped lang="scss">

</style>
