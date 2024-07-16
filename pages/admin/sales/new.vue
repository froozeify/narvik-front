<script setup lang="ts">
  import InventoryItemQuery from "~/composables/api/query/InventoryItemQuery";
  import SalePaymentModeQuery from "~/composables/api/query/SalePaymentModeQuery";
  import type {InventoryItem} from "~/types/inventoryItem";
  import {formatMonetary} from "../../../utils/string";

  definePageMeta({
    layout: "pos"
  });

  useHead({
    title: 'Nouvelle Vente'
  })

  const isLoading = ref(false)

  const inventoryItemQuery = new InventoryItemQuery()
  const paymentModeQuery = new SalePaymentModeQuery()

  const searchQuery: Ref<string> = ref('')

  const inventoryItems: Ref<InventoryItem[]> = ref([])
  const inventoryItemsLoading: Ref<InventoryItem[]> = ref([])
  const orderedItems = computed( () => {
    let categories = new Map<string, InventoryItem[]>()
    inventoryItems.value.forEach(item => {
      if (item.category && item.category.name) {
        if (!categories.has(item.category.name)) {
          categories.set(item.category.name, [])
        }

        // @ts-ignore
        categories.get(item.category.name).push(item)
      } else {
        if (!categories.has('Non définie')) {
          categories.set('Non définie', [])
        }

        // @ts-ignore
        categories.get('Non définie').push(item)
      }
    })
    return categories
  })

  async function loadItems(page: number = 1) {
    isLoading.value = true

    if (page === 1) {
      inventoryItemsLoading.value = []
    }

    const urlParams = new URLSearchParams({
      page: page.toString(),
      canBeSold: 'true',
      'exists[sellingPrice]': 'true'
    });

    if (searchQuery.value.trim().length > 0) {
      urlParams.append('multiple[name, barcode]', searchQuery.value.trim())
    }

    const { items, view } = await inventoryItemQuery.getAll(urlParams)
    inventoryItemsLoading.value = inventoryItemsLoading.value.concat(items)

    if (view &&view["hydra:next"]) {
      await loadItems(page + 1)
      return;
    }

    inventoryItems.value = inventoryItemsLoading.value
    isLoading.value = false
  }

  let inputTimer: NodeJS.Timeout;
  async function searchQueryUpdated() {
    clearTimeout(inputTimer);
    inputTimer = setTimeout(async () => {
      await loadItems()
    }, 250);
  }

  // Camera detection setup

  const cameraPreview = ref(false)
  const cameraIsPresent = verifyCameraIsPresent()

  function onDecoded(value: string) {
    searchQuery.value = value
    loadItems()
  }

  // We load the page content
  loadItems()


</script>

<template>
  <GenericLayoutContentWithStickySide>
    <template #main>
      <UCard>
        <GenericBarcodeReader
          class="mb-4"
          v-model="cameraPreview"
          @decoded="onDecoded"
        />

        <UInput
          class="mb-4"
          v-model="searchQuery"
          @update:model-value="searchQueryUpdated()"
          autofocus
          :loading="isLoading"
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
              @click="searchQuery = ''; loadItems()"
            />
          </template>
        </UInput>
        <UProgress v-if="isLoading" animation="swing" class="mb-2" />

        <div v-for="[title, items] in orderedItems">
          <div class="text-xl font-bold mb-2">{{ title }}</div>
          <div
            v-for="item in items"
            class="flex items-center gap-2 mb-1 cursor-pointer hover:bg-neutral-100 dark:hover:bg-gray-800/50 rounded-md"
          >
            <div class="flex-1 flex flex-col">
              <div class="flex-1">{{ item.name }}</div>
              <div v-if="item.sellingQuantity && item.sellingQuantity != 1" class="text-xs font-bold">Vendu par {{ item.sellingQuantity }}</div>
              <div v-if="item.description" class="text-xs">{{ item.description }}</div>
            </div>
            <div class="text-xs bg-neutral-200 dark:bg-gray-800 p-1 rounded-md">{{ formatMonetary(item.sellingPrice) }}</div>
            <UButton icon="i-heroicons-shopping-cart" size="2xs" />
          </div>
        </div>

        <div v-if="!isLoading && orderedItems.size < 1" class="text-center">
          <i>Aucun résultats</i>
        </div>
        <div v-if="isLoading && orderedItems.size < 1" class="text-center">
          <div v-for="i in (Math.floor(Math.random()*6) + 2)">
            <USkeleton class="h-4 w-32" />
            <USkeleton class="h-4 w-full my-4" />
          </div>
        </div>
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
