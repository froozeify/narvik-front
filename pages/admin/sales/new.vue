<script setup lang="ts">
  import InventoryItemQuery from "~/composables/api/query/InventoryItemQuery";
  import SalePaymentModeQuery from "~/composables/api/query/SalePaymentModeQuery";
  import type {InventoryItem} from "~/types/inventoryItem";
  import {formatMonetary} from "~/utils/string";
  import type {FormError} from "#ui/types";
  import type {SalePaymentMode} from "~/types/salePaymentMode";
  import SaleQuery from "~/composables/api/query/SaleQuery";
  import type {Sale} from "~/types/sale";
  import type {SalePurchasedItem} from "~/types/salePurchasedItem";

  definePageMeta({
    layout: "pos"
  });

  useHead({
    title: 'Nouvelle Vente'
  })

  const isLoading = ref(false)
  const isCreatingSale = ref(false)

  const toast = useToast()

  const inventoryItemQuery = new InventoryItemQuery()
  const paymentModeQuery = new SalePaymentModeQuery()
  const saleQuery = new SaleQuery()

  const searchQuery: Ref<string> = ref('')
  const searchQueryInput: Ref<string> = ref('')
  watch(searchQuery, () => {
    searchQueryInput.value = searchQuery.value
    loadItems()
  })

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

  const cart: Ref<Map<string, {item: InventoryItem, quantity: number}>> = ref(new Map())
  const cartTotalPrice = computed( () => {
    let total: number = 0
    cart.value.forEach( item => {
      total += item.quantity * Number(item.item.sellingPrice)
    } )
    return !isNaN(total) ? total.toFixed(2) : '0.00'
  } )
  const cartComment = ref('')
  const customItemForm = reactive<{name: string|undefined, sellingPrice: string|undefined}>({
    name: undefined,
    sellingPrice: undefined
  })
  const cartCustomItemModalOpen = ref(false)

  // Payment mode
  const paymentModes: Ref<SalePaymentMode[]> = ref([])
  const selectedPaymentMode: Ref<SalePaymentMode | undefined> = ref(undefined)

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

  async function loadPaymentModes() {
    const urlParams = new URLSearchParams({
      available: 'true',
    });
    const { items } = await paymentModeQuery.getAll(urlParams)
    paymentModes.value = items
  }

  let inputTimer: NodeJS.Timeout;
  async function searchQueryUpdated() {
    clearTimeout(inputTimer);
    inputTimer = setTimeout(async () => {
      searchQuery.value = searchQueryInput.value
    }, 250);
  }

  // Camera detection setup

  const cameraPreview = ref(false)
  const cameraIsPresent = verifyCameraIsPresent()

  // Cart management

  const validateCustomItemForm = (state: any): FormError[] => {
    const errors = []
    if (!state.name) errors.push({ path: 'name', message: 'Champ requis' })
    if (!state.sellingPrice) errors.push({ path: 'sellingPrice', message: 'Champ requis' })
    const sellingPrice = parseFloat(state.sellingPrice)
    if (isNaN(sellingPrice)) errors.push({ path: 'sellingPrice', message: 'Le champ doit être un nombre' })
    return errors
  }

  function addToCart(item: InventoryItem, modifier: number = 1) {
    if (!item.id) {
      return
    }

    searchQuery.value = '' // Since the item has been added to the cart, we revert to empty search

    let cartItem = cart.value.get(item.id.toString())

    if (!cartItem) {
      cartItem = { quantity: modifier, item: item }
    } else {
      cartItem.quantity += modifier
    }

    if (cartItem.quantity <= 0) {
      cart.value.delete(item.id.toString())
    } else {
      cart.value.set(item.id.toString(), cartItem)
    }
  }

  function emptyCart() {
    cart.value.clear()
    searchQuery.value = ''
    selectedPaymentMode.value = undefined
    cartComment.value = ''
  }

  function addCustomItemToCart() {
    if (!customItemForm.sellingPrice) {
      closeCustomItemModal()
      return
    }

    // Negative ID, Backend know it's not a real item
    const item: InventoryItem = {
      id: - Math.floor(Math.random() * 200000),
      name: customItemForm.name,
      sellingPrice: parseFloat(customItemForm.sellingPrice.replace(',', '.')).toFixed(2),
    }
    addToCart(item)
    closeCustomItemModal()
  }

  function closeCustomItemModal() {
    customItemForm.name = undefined
    customItemForm.sellingPrice = undefined
    cartCustomItemModalOpen.value = false
  }

  // Sale management
  async function createSale() {
    isCreatingSale.value = true

    let salePurchasedItems: SalePurchasedItem[] = []
    cart.value.forEach((item, key) => {
      let payload: SalePurchasedItem = {
        quantity: item.quantity
      }

      if (Number(key) > 0) {
        payload.item = item.item['@id']
      } else {
        payload.itemName = item.item.name
        payload.itemPrice = item.item.sellingPrice
      }

      salePurchasedItems.push(payload)
    })

    const payload: Sale = {
      comment: cartComment.value.length ? cartComment.value : undefined,
      salePurchasedItems: salePurchasedItems,
      paymentMode: selectedPaymentMode.value?.["@id"]
    }

    const { created, error } = await saleQuery.post(payload)

    isCreatingSale.value = false

    if (!created || error) {
      toast.add({
        color: "red",
        title: "La vente à échoué",
        description: error.message
      });
      return;
    }

    toast.add({
      color: "green",
      title: "Vente enregistrée",
    });

    navigateTo('/admin/sales/' + created.id)
  }

  // We load the page content
  loadItems()
  loadPaymentModes()

</script>

<template>
  <GenericLayoutContentWithStickySide>
    <template #main>
      <UCard>
        <GenericBarcodeReader
          class="mb-4"
          v-model="cameraPreview"
          @decoded="(value) => {searchQuery = value}"
        />

        <div class="flex flex-row items-center mb-4 gap-2">
          <UInput
            class="flex-1"
            v-model="searchQueryInput"
            @update:model-value="searchQueryUpdated()"
            autofocus
            :loading="isLoading"
            placeholder="Rechercher..."
            :ui="{ icon: { trailing: { pointer: '' } } }"
          >
            <template #trailing v-if="cameraIsPresent || searchQueryInput">
              <UIcon
                v-if="cameraIsPresent"
                class="cursor-pointer"
                name="i-heroicons-qr-code"
                @click="cameraPreview = true"
              />

              <UIcon
                v-if="searchQueryInput"
                class="cursor-pointer"
                name="i-heroicons-x-mark"
                @click="searchQuery = '';"
              />
            </template>
          </UInput>

          <UButton @click="cartCustomItemModalOpen = true;" icon="i-heroicons-plus" />
        </div>
        <UProgress v-if="isLoading" animation="swing" class="mb-2" />

        <div v-for="[title, items] in orderedItems" class="mb-4">
          <div class="text-xl font-bold mb-2 border-b">{{ title }}</div>
          <div
            v-for="item in items"
            class="flex items-center gap-2 mb-1 hover:bg-neutral-100 dark:hover:bg-gray-800/50 rounded-md"
          >
            <div class="flex-1 flex flex-col">
              <div class="flex-1">{{ item.name }}</div>
              <div v-if="item.sellingQuantity && item.sellingQuantity != 1" class="text-xs font-bold">Vendu par {{ item.sellingQuantity }}</div>
              <div v-if="item.description" class="text-xs">{{ item.description }}</div>
            </div>
            <div class="text-xs bg-neutral-200 dark:bg-gray-800 p-1 rounded-md">{{ formatMonetary(item.sellingPrice) }}</div>
            <UButton icon="i-heroicons-shopping-cart" size="2xs" @click="addToCart(item)" />
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

      <UModal v-model="cartCustomItemModalOpen">
        <UCard>
          <UForm class="flex gap-2 flex-col" :state="customItemForm" :validate="validateCustomItemForm" @submit="addCustomItemToCart">
            <UFormGroup label="Nom" name="name">
              <UInput v-model="customItemForm.name"/>
            </UFormGroup>

            <UFormGroup label="Prix de vente" name="sellingPrice">
              <UInput v-model="customItemForm.sellingPrice">
                <template #trailing>
                  <span class="text-gray-500 dark:text-gray-400 text-xs">EUR</span>
                </template>
              </UInput>
            </UFormGroup>

            <div class="flex gap-2 mt-2 justify-end">
              <UButton color="red" variant="ghost" @click="closeCustomItemModal()">
                Annuler
              </UButton>

              <UButton type="submit">
                Ajouter au panier
              </UButton>
            </div>
          </UForm>
        </UCard>
      </UModal>
    </template>

    <template #side>
      <UCard class="overflow-y-auto">
        <div class="text-4xl text-center">{{ formatMonetary(cartTotalPrice) }}</div>
        <div class="mt-4">
          <div class="flex text-xs align-center mt-1">
            <div class="flex-1"></div>
            <UButton v-if="cart.size > 0" size="xs" @click="emptyCart()">Vider le panier</UButton>
          </div>
          <div v-if="cart.size < 1" class="text-center">
            <i>Aucun articles</i>
          </div>
          <div v-for="[id , cartItem] in cart" class="flex items-center gap-2 mb-1">
            <GenericStackedUpDown @changed="modifier => { addToCart(cartItem.item, modifier) }" />

            <div class="text-xs bg-neutral-200 dark:bg-gray-800 p-1 rounded-md">{{ cartItem.quantity }}</div>
            <div class="text-sm flex-1 leading-tight">{{ cartItem.item.name }}</div>
            <UTooltip :text="'Prix unitaire : ' + formatMonetary(cartItem.item.sellingPrice)">
              <div class="text-xs bg-neutral-200 dark:bg-gray-800 p-1 rounded-md">
                <template v-if="cartItem.item.sellingPrice">
                  {{ formatMonetary(Number(Number(cartItem.item.sellingPrice) * cartItem.quantity).toFixed(2)) }}
                </template>
                <template v-else>
                  {{ formatMonetary(cartItem.item.sellingPrice) }}
                </template>
              </div>
            </UTooltip>
          </div>
        </div>
      </UCard>

      <UCard>
        <UFormGroup label="Commentaire" :error="cartComment.length > 249 && 'Longueur maximum atteinte (250)'" class="mb-2">
          <UTextarea v-model="cartComment" :rows="2" autoresize :maxrows="3" placeholder="Commentaire liée à la vente"/>
        </UFormGroup>

        <UFormGroup label="Mode de paiement">
          <div class="flex flex-wrap gap-2">
            <UButton
              v-for="paymentMode in paymentModes"
              :variant="selectedPaymentMode?.id == paymentMode.id ? 'solid' : 'soft'"
              class="basis-[calc(50%-0.25rem)]">
              <div class="flex items-center w-full" @click="selectedPaymentMode = paymentMode">
                <UIcon :name="'i-heroicons-' + paymentMode.icon" dynamic />
                <div class="flex-1">
                  {{ paymentMode.name }}
                </div>
              </div>
            </UButton>
          </div>
        </UFormGroup>

        <UButton :loading="isCreatingSale" class="mt-4" block color="green" :disabled="cart.size < 1 || !selectedPaymentMode" @click="createSale()">Finaliser la vente</UButton>
      </UCard>
    </template>
  </GenericLayoutContentWithStickySide>
</template>

<style scoped lang="scss">

</style>
