<script setup lang="ts">
  import {usePaginationValues} from "~/composables/api/list";
  import InventoryItemQuery from "~/composables/api/query/InventoryItemQuery";
  import type {InventoryItem} from "~/types/api/item/inventoryItem";
  import InventoryCategoryQuery from "~/composables/api/query/InventoryCategoryQuery";
  import type {InventoryCategory} from "~/types/api/item/inventoryCategory";
  import {verifyCameraIsPresent} from "~/utils/browser";

  definePageMeta({
    layout: "pos"
  });

  useHead({
    title: 'Inventaire'
  })

  const queryParams = useRoute().query

  const apiQuery = new InventoryItemQuery()
  const itemCategoryQuery = new InventoryCategoryQuery()

  const searchQuery: Ref<string> = ref('')
  const categories: Ref<InventoryCategory[]> = ref([])
  const filteredCategories: Ref<InventoryCategory[]> = ref([])
  itemCategoryQuery.getAll().then(value => {
    categories.value = value.items

    // Filter is apply on a category
    if (!isNaN(queryParams.category)) {
      const matchedCategory = value.items.find( (category) => category.id == queryParams.category)
      if (matchedCategory) {
        filteredCategories.value.push(matchedCategory)
        useRouter().replace(useRouter().currentRoute.value.path) // We remove the param from the url
        getItemsPaginated()
      }
    }
  });

  const apiItems: Ref<InventoryItem[]> = ref([])
  const isLoading = ref(true);
  const totalApiItems = ref(0)
  const selectedItem: Ref<InventoryItem | undefined> = ref(undefined)

  watch(filteredCategories, () => {
    getItemsPaginated()
  })

  let inputTimer: NodeJS.Timeout;
  async function searchQueryUpdated() {
    clearTimeout(inputTimer);
    inputTimer = setTimeout(async () => {
      page.value = 1;
      await getItemsPaginated()
    }, 500);
  }

  // Table settings
  const page = ref(1);
  const itemsPerPage = ref(30);
  const sort = ref({
    column: 'quantity',
    direction: 'asc'
  });
  const columns = [
    {
      key: 'quantity',
      label: 'Quantité en stock',
      sortable: true,
    },
    {
      key: 'name',
      label: 'Nom',
      sortable: true,
      class: 'w-full'
    },
    {
      key: 'category',
      label: 'Catégorie'
    }
  ]

  function rowClicked(row: object) {
    selectedItem.value = {...row} // We make a shallow clone
  }

  // We get the data from the api on first page load
  getItemsPaginated()
  async function getItemsPaginated() {
    isLoading.value = true

    const urlParams = new URLSearchParams({
      page: page.value.toString(),
      itemsPerPage: itemsPerPage.value.toString(),
    });

    if (filteredCategories.value.length > 0) {
      filteredCategories.value.forEach(filteredCategory => {
        if (!filteredCategory.id) return;
        urlParams.append('category.id[]', filteredCategory.id.toString())
      })
    }

    // When filter by name the category is applied before
    if (sort.value.column === 'name') {
      urlParams.append(`order[category.weight]`, 'asc');
    }

    urlParams.append(`order[${sort.value.column}]`, sort.value.direction);

    // For remaining items we sort first by this then by category
    if (sort.value.column === 'quantity') {
      urlParams.append(`order[category.weight]`, 'asc');
    }


    if (searchQuery.value.trim().length > 0) {
      urlParams.append('multiple[name, barcode]', searchQuery.value.trim())
    }

    const { totalItems, items } = await apiQuery.getAll(urlParams)
    apiItems.value = items
    if (totalItems) {
      totalApiItems.value = totalItems
    }

    isLoading.value = false
  }

  // InventoryItemModal
  const inventoryItemModalOpen = ref(false)

  // Camera detection setup

  const cameraPreview = ref(false)
  const cameraIsPresent = verifyCameraIsPresent()

  function onDecoded(value: string) {
    searchQuery.value = value
    page.value = 1
    getItemsPaginated()
  }
</script>

<template>
  <GenericLayoutContentWithStickySide @keyup.esc="selectedItem = undefined;" :has-side-content="selectedItem !== undefined" :mobile-side-title="selectedItem?.name" tabindex="-1">
    <template #main>
      <UCard>
        <div class="flex gap-2 flex-col flex-wrap sm:flex-row">
          <GenericBarcodeReader
            v-model="cameraPreview"
            @decoded="onDecoded"
          />

          <UInput
            v-model="searchQuery"
            @update:model-value="searchQueryUpdated()"
            placeholder="Rechercher..."
            :ui="{ icon: { trailing: { pointer: '' } } }"
          >
            <template #trailing v-if="cameraIsPresent || searchQuery">
              <UIcon
                v-if="cameraIsPresent"
                class="cursor-pointer"
                name="i-heroicons-qr-code"
                @click="cameraPreview = true"
              />

              <UIcon
                v-if="searchQuery"
                class="cursor-pointer"
                name="i-heroicons-x-mark"
                @click="searchQuery = ''; getItemsPaginated()"
              />
            </template>
          </UInput>

          <div class="flex-1"></div>

          <div class="flex gap-4 justify-between">
            <USelectMenu
              class="w-44"
              v-model="filteredCategories"
              :options="categories"
              option-attribute="name"
              multiple
            >
              <template #label>
              <span v-if="filteredCategories.length" class="truncate">
                {{ filteredCategories.map(fa => fa.name).join(', ') }}
              </span>
                <span v-else>Catégories</span>
              </template>
            </USelectMenu>

            <UButton @click="selectedItem = undefined; inventoryItemModalOpen = true" icon="i-heroicons-plus" />
          </div>


        </div>

        <UTable
          class="w-full"
          :loading="isLoading"
          v-model:sort="sort"
          sort-mode="manual"
          @update:sort="getItemsPaginated()"
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

          <template #quantity-data="{ row }">
            <p v-if="row.quantity" :class="row.quantityAlert && row.quantity <= row.quantityAlert ? 'font-bold text-red-600' : ''">
              {{ row.quantity }}
            </p>
            <i v-else>Non définie</i>
          </template>

          <template #category-data="{ row }">
            <UButton v-if="row.category"
              variant="soft"
              :ui="{ rounded: 'rounded-full' }">
              {{ row.category.name }}
            </UButton>

            <i v-else>
              Pas de catégorie.
            </i>

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
          <InventoryItemForm :item="selectedItem" :view-only="true" />
          <UButton
            class="mt-4"
            block
            @click="inventoryItemModalOpen = true"
          >
            Modifier
          </UButton>
        </UCard>

        <UButton block :to="'/admin/inventories/items/' + selectedItem.id">Voir en détail</UButton>
      </template>
    </template>

  </GenericLayoutContentWithStickySide>

  <UModal
    v-model="inventoryItemModalOpen">
    <UCard>
      <InventoryItemForm
        :item="selectedItem ? {...selectedItem} : undefined"
        :categories="categories"
        @updated="(value) => {selectedItem = value; inventoryItemModalOpen = false; getItemsPaginated() }"
      />
    </UCard>
  </UModal>

</template>

<style scoped lang="scss">

</style>
