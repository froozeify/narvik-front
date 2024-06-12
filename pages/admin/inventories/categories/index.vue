<script setup lang="ts">
  import InventoryCategoryQuery from "~/composables/api/query/InventoryCategoryQuery";
  import type {InventoryCategory} from "~/types/inventorycategory";
  import {usePaginationValues} from "~/composables/api/list";
  import type {Member} from "~/types/member";

  definePageMeta({
    layout: "pos"
  });

  useHead({
    title: 'Catégorie d\'inventaire'
  })

  const toast = useToast()
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

  async function move(row: InventoryCategory, modifier: number) {
    isLoading.value = true
    const { error } = await apiQuery.move(row, modifier === 1 ? 'down' : 'up');
    isLoading.value = false

    if (error) {
      toast.add({
        color: "red",
        title: "La modification a échouée",
        description: error.message
      });
      return;
    }

    // We refresh the list
    await getCategoriesPaginated();
  }

  async function updateCategory(category: InventoryCategory) {
    isLoading.value = true
    let payload: InventoryCategory = {
      name: category.name
    }

    const { error } = await apiQuery.patch(category, payload);
    isLoading.value = false

    if (error) {
      toast.add({
        color: "red",
        title: "La modification a échouée",
        description: error.message
      });
      return;
    }

    // We refresh the list
    await getCategoriesPaginated();
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

        <UButton block :loading="isLoading" @click="updateCategory(selectedCategory)">Enregistrer</UButton>
        <UButton color="red" block :loading="isLoading">Supprimer</UButton>
      </template>
    </template>
  </GenericLayoutContentWithStickySide>
</template>

<style scoped lang="scss">

</style>
