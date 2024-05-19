<script setup lang="ts">
  definePageMeta({
    layout: "pos"
  });

  useHead({
    title: 'Nouvelle Vente'
  })
</script>

<template>
  <div class="flex flex-col-reverse lg:flex-row gap-4">
    <UCard class="lg:w-2/3 shrink-0">
      Liste des items a vendre
      <ul v-for="i in 100">
        <li>Item {{ i }}</li>
      </ul>
    </UCard>

    <div class="w-full h-fit lg:sticky lg:top-20 max-h-[calc(100vh-6rem)] flex flex-col gap-4">
      <UCard class="overflow-y-auto">
        <div class="text-4xl text-center">xx.xx €</div>
        <ul class="mt-4">
          <li v-for="i in 4" class="flex items-center gap-2 mb-1">
            <div class="text-xs flex flex-col gap-0.5">
              <div class="p-0.5 rounded-md text-primary-500 dark:text-primary-400 bg-primary-50 hover:bg-primary-100 dark:bg-primary-950 dark:hover:bg-primary-900 flex justify-center items-center">
                <UIcon name="i-heroicons-chevron-up"/>
              </div>
              <div class="p-0.5 rounded-md text-primary-500 dark:text-primary-400 bg-primary-50 hover:bg-primary-100 dark:bg-primary-950 dark:hover:bg-primary-900 flex justify-center items-center">
                <UIcon name="i-heroicons-chevron-down"/>
              </div>
            </div>

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
    </div>

  </div>
</template>

<style scoped lang="scss">

</style>
