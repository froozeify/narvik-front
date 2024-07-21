<script setup lang="ts">
  import InventoryCategoryQuery from "~/composables/api/query/InventoryCategoryQuery";
  import type {InventoryCategory} from "~/types/inventorycategory";
  import {usePaginationValues} from "~/composables/api/list";
  import type {Member} from "~/types/member";
  import ModalDeleteConfirmation from "~/components/Modal/ModalDeleteConfirmation.vue";
  import type {FormError} from "#ui/types";

  definePageMeta({
    layout: "pos"
  });

  useHead({
    title: 'Catégorie d\'inventaire'
  })

  const toast = useToast()
  const modal = useModal()
  const apiQuery = new InventoryCategoryQuery();

  const categories: Ref<InventoryCategory[]> = ref([])
  const isLoading = ref(true);
  const totalCategories = ref(0)
  const selectedCategory: Ref<InventoryCategory | undefined> = ref(undefined)

  // Side menu visible
  const isVisible = ref(false);
  // We watch the selected item so we close the side menu if unselected
  watch(selectedCategory, (value, oldValue) => {
    isVisible.value = value !== undefined
  })

  // Table settings
  const page = ref(1);
  const itemsPerPage = ref(30);
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
    let error: Error | null = null
    if (!category.id) {
      await apiQuery.post(payload).then(value => {
        error = value.error
        selectedCategory.value = value.created
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

  async function deleteCategory() {
    isLoading.value = true
    const { error } = await apiQuery.delete(selectedCategory.value)
    isLoading.value = false

    if (error) {
      toast.add({
        color: "red",
        title: "La suppression a échouée",
        description: error.message
      });
      return;
    }

    selectedCategory.value = undefined
    // We refresh the list
    await getCategoriesPaginated();
  }

  const validate = (state: any): FormError[] => {
    const errors = []
    if (!state.name) errors.push({ path: 'name', message: 'Champ requis' })
    return errors
  }

</script>

<template>
  <GenericLayoutContentWithStickySide @keyup.esc="isVisible = false; selectedCategory = undefined;" :has-side-content="isVisible" :mobile-side-title="selectedCategory?.name" tabindex="-1">
    <template #main>
      <UCard>
        <div>
          <div class="flex gap-4">
            <div class="flex-1"></div>
            <UButton @click="createCategory">
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
        </div>
      </UCard>
    </template>

    <template #side>
      <template v-if="selectedCategory">
        <UForm :state="selectedCategory" @submit="updateCategory(selectedCategory)" :validate="validate" class="flex flex-col gap-4">
          <UCard>
            <div class="flex gap-2 flex-col">
              <UFormGroup label="Nom" name="name">
                <UInput v-model="selectedCategory.name" />
              </UFormGroup>
            </div>

          </UCard>

          <UButton v-if="selectedCategory.id" color="green" block :loading="isLoading" :to="'/admin/inventories?category=' + selectedCategory.id">Voir les articles</UButton>

          <UButton type="submit" block :loading="isLoading">Enregistrer</UButton>

          <UButton
            v-if="selectedCategory.id"
            block
            color="red"
            :loading="isLoading"
            :disabled="(selectedCategory?.items?.length ?? 0) > 0"
            @click="modal.open(ModalDeleteConfirmation, {
              onDelete() {
                modal.close()
                deleteCategory()
              }
            })"
          >
            Supprimer
          </UButton>
        </UForm>

      </template>
    </template>
  </GenericLayoutContentWithStickySide>
</template>

<style scoped lang="scss">

</style>
