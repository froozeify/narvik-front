<script setup lang="ts">
  import {usePaginationValues} from "~/composables/api/list";
  import InventoryCategoryQuery from "~/composables/api/query/InventoryCategoryQuery";
  import type {InventoryCategory} from "~/types/inventorycategory";
  import InventoryItemQuery from "~/composables/api/query/InventoryItemQuery";
  import type {Inventoryitem} from "~/types/inventoryitem";

  definePageMeta({
    layout: "pos"
  });

  useHead({
    title: 'Inventaire'
  })

  const apiQuery = new InventoryItemQuery();

  const apiItems: Ref<Inventoryitem> = ref([])
  const isLoading = ref(true);
  const totalApiItems = ref(0)
  const selectedItem: Ref<Inventoryitem | null> = ref(null)

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
  getItemsPaginated()

  async function getItemsPaginated() {
    isLoading.value = true

    const urlParams = new URLSearchParams({
      pagination: '1',
      page: page.value.toString(),
      itemsPerPage: itemsPerPage.value.toString(),
    });

    urlParams.append(`order[${sort.value.column}]`, sort.value.direction);

    const { totalItems, items } = await apiQuery.getAll(urlParams)
    apiItems.value = items
    if (totalItems) {
      totalApiItems.value = totalItems
    }

    isLoading.value = false
  }

  function rowClicked(row: object) {
    selectedItem.value = {...row} // We make a shallow clone
    isVisible.value = true
  }
</script>

<template>
  <GenericLayoutContentWithStickySide :display-side="isVisible" @keyup.esc="isVisible = false; selectedItem = null;" tabindex="-1">
    <template #main>
      <UCard>
        Add category filter (+ filter from url param so we can redirect from category page).
        Tri par nom et catégorie.
        Supprimer weight pour InventoryItem
        <UTable
          class="w-full"
          :loading="isLoading"
          :sort="sort"
          :columns="columns"
          :rows="apiItems"
          @select="rowClicked">
          <template #empty-state>
            <div class="flex flex-col items-center justify-center py-6 gap-3">
              <span class="italic text-sm">Aucun articles.</span>
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
          <USelect v-model="itemsPerPage" :options="usePaginationValues" @update:model-value="getItemsPaginated()" />
          <UPagination v-model="page" @update:model-value="getItemsPaginated()" :page-count="parseInt(itemsPerPage.toString())" :total="totalApiItems" />
        </div>

      </UCard>
    </template>

    <template #side>
      <template v-if="selectedItem">
        <UCard class="overflow-y-auto">

          <div class="flex gap-2 flex-col">
            <UFormGroup label="Peut être vendu">
              <UToggle :model-value="selectedItem.canBeSold" />
            </UFormGroup>

            <UFormGroup
              v-for="(value, key) in {
                'Nom': selectedItem.name,
                'Description': selectedItem.description,
                'Prix d\'achat': selectedItem.purchasePrice,
                'Prix de vente': selectedItem.sellingPrice,
              }"
              :label="key"
            >
              <UInput :model-value="value" class="pointer-events-none" tabindex="-1" />
            </UFormGroup>
          </div>

        </UCard>

        <UButton block @click="console.log(selectedItem)">Voir en détail</UButton>
      </template>
    </template>
  </GenericLayoutContentWithStickySide>
</template>

<style scoped lang="scss">

</style>
