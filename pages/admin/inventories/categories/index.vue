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

  const categories: Ref<InventoryCategory[]> = ref([])
  const isLoading = ref(true);
  const totalCategories = ref(0)
  const selectedCategory: Ref<InventoryCategory | null> = ref(null)

  // Side menu visible
  const isVisible = ref(false);
  // We watch the selected item so we close the side menu if unselected
  watch(selectedCategory, (value, oldValue) => {
    isVisible.value = value !== null
  })

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

  async function createCategory() {
    let category: InventoryCategory = {
      name: ''
    }
    selectedCategory.value = category
  }

  async function updateCategory(category: InventoryCategory) {
    isLoading.value = true
    let payload: InventoryCategory = {
      name: category.name
    }

    // We verify if it's a creation or an update
    let error: null | Error = null
    if (!category.id) {
      await apiQuery.post(payload).then(value => {
        error = value.error
        selectedCategory.value = null
      });
    } else { // Update
      await apiQuery.patch(category, payload).then(value => {
        error = value.error
      });
    }

    isLoading.value = false

    if (error) {
      toast.add({
        color: "red",
        title: !category.id ? "La création a échouée" : "La modification a échouée",
        description: error.message
      });
      return;
    }

    toast.add({
      color: "green",
      title: !category.id ? "Catégorie créée" : "Catégorie modifiée",
    });

    // We refresh the list
    await getCategoriesPaginated();
  }

  async function deleteCategory(close: Function) {
    console.log(selectedCategory.value)
    isLoading.value = true
    const { error } = await apiQuery.delete(selectedCategory.value)
    isLoading.value = false
    close()

    if (error) {
      toast.add({
        color: "red",
        title: "La suppression a échouée",
        description: error.message
      });
      return;
    }

    selectedCategory.value = null
    // We refresh the list
    await getCategoriesPaginated();
  }

</script>

<template>
  <GenericLayoutContentWithStickySide :display-side="isVisible" @keyup.esc="isVisible = false; selectedCategory = null;" tabindex="-1">
    <template #main>
      <UCard>

        <div class="flex gap-4">

          <div class="flex-1"></div>
          <UButton @click="createCategory" >
            Créer une catégorie
          </UButton>
        </div>

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

        <UPopover>
          <UButton
            v-if="selectedCategory.id"
            color="red" block
            :loading="isLoading"
            :disabled="selectedCategory.items?.length > 0"
          >
            Supprimer
          </UButton>


          <template #panel="{ close }">
            <div class="p-4 w-56 flex flex-col gap-4">
              <div class="text-center text-lg font-bold">Êtes-vous certain ?</div>

              <UButton
                @click="deleteCategory(close)"
                color="red"
                class="mx-auto"
              >
                Supprimer
              </UButton>
            </div>
          </template>
        </UPopover>

      </template>
    </template>
  </GenericLayoutContentWithStickySide>
</template>

<style scoped lang="scss">

</style>
