<script setup lang="ts">
  definePageMeta({
    layout: "pos"
  });

  useHead({
    title: 'Nouvelle Vente'
  })
</script>

<template>
  <GenericLayoutContentWithStickySide>
    <template #main>
      <UCard>
        Liste des items a vendre
        <ul v-for="i in 100">
          <li>Item {{ i }}</li>
        </ul>
      </UCard>
    </template>

    <template #side>
      <UCard class="overflow-y-auto">
        <div class="text-4xl text-center">xx.xx €</div>
        <ul class="mt-4">
          <li v-for="i in 4" class="flex items-center gap-2 mb-1">
            <GenericStackedUpDown />

            <div class="text-xs bg-neutral-200 dark:bg-gray-800 p-1 rounded-md">1</div>
            <div class="text-sm flex-1 leading-tight">Item long titre {{ i }}</div>
            <div class="text-xs bg-neutral-200 dark:bg-gray-800 p-1 rounded-md">xx,xx €</div>
          </li>
        </ul>
      </UCard>

      <UCard>
        <div class="flex flex-wrap justify-center gap-2">
          <UButton v-for="i in ['banknotes', 'ticket', 'credit-card']" variant="soft" class="basis-[calc(50%-0.25rem)]">
            <div class="flex items-center w-full">
            <UIcon :name="'i-heroicons-' + i" dynamic />
            <div class="flex-1">
              {{ i }}
            </div>
            </div>
          </UButton>
        </div>
      </UCard>
    </template>
  </GenericLayoutContentWithStickySide>
</template>

<style scoped lang="scss">

</style>
