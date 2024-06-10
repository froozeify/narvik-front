<script setup lang="ts">
  import InventoryCategoryQuery from "~/composables/api/query/InventoryCategoryQuery";
  import type {InventoryCategory} from "~/types/inventorycategory";
  import {usePaginationValues} from "~/composables/api/list";

  definePageMeta({
    layout: "pos"
  });

  useHead({
    title: 'Catégorie d\'inventaire'
  })

  const apiQuery = new InventoryCategoryQuery();

  const categories: Ref<InventoryCategory> = ref([])
  const isLoading = ref(true);
  const totalCategories = ref(0)
  const selectedCategory: Ref<InventoryCategory | null> = ref(null)

  // Side menu visible
  const isVisible = ref(false);

  // Table settings
  const page = ref(1);
  const itemsPerPage = ref(10);
  const sort = ref({
    column: 'weight',
    direction: 'asc'
  });
  const columns = [
    {
      key: 'name',
      label: 'Nom',
      class: 'w-full'
    },
    {
      key: 'actions',
    }
  ]

  // We get the data from the api on first page load
  getCategoriesPaginated()

  async function getCategoriesPaginated() {
    isLoading.value = true

    const urlParams = new URLSearchParams({
      pagination: '1',
      page: page.value.toString(),
      itemsPerPage: itemsPerPage.value.toString(),
    });

    urlParams.append(`order[${sort.value.column}]`, sort.value.direction);

    const { totalItems, items } = await apiQuery.getAll(urlParams)
    categories.value = items
    if (totalItems) {
      totalCategories.value = totalItems
    }

    isLoading.value = false
  }

  function rowClicked(row: object) {
    selectedCategory.value = {...row} // We make a shallow clone
    isVisible.value = true
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
  <GenericLayoutContentWithStickySide :display-side="isVisible" @keyup.esc="isVisible = false; selectedCategory = null;" tabindex="-1">
    <template #main>
      <UCard>
        <UTable
          class="w-full"
          :loading="isLoading"
          :sort="sort"
          :columns="columns"
          :rows="categories"
          @select="rowClicked">
          <template #empty-state>
            <div class="flex flex-col items-center justify-center py-6 gap-3">
              <span class="italic text-sm">Aucune catégories.</span>
            </div>
          </template>

          <template #name-data="{ row }">
            {{ row.name }}
          </template>

          <template #actions-data="{ row }">
            <GenericStackedUpDown @changed="modifier => { move(row, -modifier) }" />
          </template>

        </UTable>

        <div class="flex justify-end gap-4 px-3 py-3.5 border-t border-gray-200 dark:border-gray-700">
          <USelect v-model="itemsPerPage" :options="usePaginationValues" @update:model-value="getCategoriesPaginated()" />
          <UPagination v-model="page" @update:model-value="getCategoriesPaginated()" :page-count="parseInt(itemsPerPage.toString())" :total="totalCategories" />
        </div>

      </UCard>
    </template>

    <template #side>
      <template v-if="selectedCategory">
        <UCard class="overflow-y-auto">

          <div class="flex gap-2 flex-col">
            <UFormGroup label="Nom" :error="!selectedCategory.name && 'Champ requis'">
              <UInput v-model="selectedCategory.name" />
            </UFormGroup>
          </div>

        </UCard>

        <UButton block @click="console.log(selectedCategory)">Enregistrer</UButton>
        <UButton color="red" block>Supprimer</UButton>
      </template>
    </template>
  </GenericLayoutContentWithStickySide>
</template>

<style scoped lang="scss">

</style>
