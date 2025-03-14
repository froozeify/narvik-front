<script setup lang="ts">
  import {usePaginationValues} from "~/composables/api/list";
  import InventoryItemQuery from "~/composables/api/query/clubDependent/plugin/sale/InventoryItemQuery";
  import type {InventoryItem} from "~/types/api/item/clubDependent/plugin/sale/inventoryItem";
  import InventoryCategoryQuery from "~/composables/api/query/clubDependent/plugin/sale/InventoryCategoryQuery";
  import type {InventoryCategory} from "~/types/api/item/clubDependent/plugin/sale/inventoryCategory";
  import {createBrowserCsvDownload, verifyCameraIsPresent} from "~/utils/browser";
  import {convertUuidToUrlUuid, decodeUrlUuid} from "~/utils/resource";
  import {formatDateInput} from "~/utils/date";

  definePageMeta({
    layout: "pos"
  });

  useHead({
    title: 'Inventaire'
  })

  const queryParams = useRoute().query

  const isSideVisible = ref(false)

  const apiQuery = new InventoryItemQuery()
  const itemCategoryQuery = new InventoryCategoryQuery()

  const searchQuery: Ref<string> = ref('')
  const categories: Ref<InventoryCategory[]> = ref([])
  const filteredCategories: Ref<InventoryCategory[]> = ref([])
  itemCategoryQuery.getAll().then(value => {
    categories.value = value.items

    // Filter is apply on a category
    if (queryParams.category !== undefined) {
      const matchedCategory = value.items.find( (category) => category.uuid == decodeUrlUuid(queryParams.category?.toString()))
      if (matchedCategory) {
        filteredCategories.value.push(matchedCategory)
        useRouter().replace(useRouter().currentRoute.value.path) // We remove the param from the url
        getItemsPaginated()
      }
    }
  });

  const apiItems: Ref<InventoryItem[]> = ref([])
  const isLoading = ref(true);
  const isDownloadingCsv = ref(false)
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
    },
    {
      key: 'description',
      label: 'Description',
      class: 'w-full'
    },
    {
      key: 'category',
      label: 'Catégorie'
    }
  ]

  function rowClicked(row: object) {
    selectedItem.value = {...row} // We make a shallow clone
    isSideVisible.value = true
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
        if (!filteredCategory.uuid) return;
        urlParams.append('category.uuid[]', filteredCategory.uuid)
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

  function onItemUpdated(value: InventoryItem) {
    selectedItem.value = value
    inventoryItemModalOpen.value = false
    isSideVisible.value = false
    getItemsPaginated()
  }

  // Camera detection setup

  const cameraPreview = ref(false)
  const cameraIsPresent = verifyCameraIsPresent()

  function onDecoded(value: string) {
    searchQuery.value = value
    page.value = 1
    getItemsPaginated()
  }

  async function downloadCsv() {
    isDownloadingCsv.value = true

    const urlParams = new URLSearchParams({
      pagination: 'false',
    });

    if (searchQuery.value) {
      urlParams.append(`multiple[name, barcode]`, searchQuery.value);
    }

    // We make the search
    const { data } = await apiQuery.getAllCsv(urlParams)
    isDownloadingCsv.value = false
    createBrowserCsvDownload('inventory-items.csv', data)
  }
</script>

<template>
  <GenericLayoutContentWithSlideover v-model="isSideVisible" tabindex="-1">
    <template #main>
      <UCard>
        <div class="flex mb-2">
          <div class="flex-1"></div>
          <UButton @click="downloadCsv()" icon="i-heroicons-arrow-down-tray" color="green" :loading="isDownloadingCsv">
            CSV
          </UButton>
        </div>
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
        <UButton block class="mb-4" :to="'/admin/inventories/items/' + convertUuidToUrlUuid(selectedItem.uuid)">Voir en détail</UButton>


        <UCard class="overflow-y-auto">
          <InventoryItemForm
            :item="selectedItem"
            :categories="categories"
            @updated="onItemUpdated"
          />
        </UCard>

      </template>
    </template>

  </GenericLayoutContentWithSlideover>

  <UModal
    v-model="inventoryItemModalOpen">
    <UCard>
      <InventoryItemForm
        :item="selectedItem ? {...selectedItem} : undefined"
        :categories="categories"
        @updated="onItemUpdated"
      />
    </UCard>
  </UModal>

</template>

<style scoped lang="scss">

</style>
