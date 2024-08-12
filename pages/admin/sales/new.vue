<script setup lang="ts">
  import InventoryItemQuery from "~/composables/api/query/InventoryItemQuery";
  import SalePaymentModeQuery from "~/composables/api/query/SalePaymentModeQuery";
  import type {InventoryItem} from "~/types/api/item/inventoryItem";
  import {formatMonetary} from "~/utils/string";
  import type {SalePaymentMode} from "~/types/api/item/salePaymentMode";
  import SaleQuery from "~/composables/api/query/SaleQuery";
  import type {Sale} from "~/types/api/item/sale";
  import type {SalePurchasedItem} from "~/types/api/item/salePurchasedItem";
  import {useCartStore} from "~/stores/useCartStore";
  import {formatDate} from "~/utils/date";
  import dayjs from "dayjs";

  definePageMeta({
    layout: "pos"
  });

  useHead({
    title: 'Nouvelle Vente'
  })

  const isLoading = ref(false)
  const isCreatingSale = ref(false)

  const toast = useToast()

  const saleStore = useSaleStore()
  const cartStore = useCartStore()
  const { searchQuery, cart, cartTotalPrice, cartComment, cartCustomItemModalOpen, customItemForm, selectedPaymentMode } = storeToRefs(cartStore)
  const { sellers, seller, paymentModes } = storeToRefs(saleStore)

  const inventoryItemQuery = new InventoryItemQuery()
  const paymentModeQuery = new SalePaymentModeQuery()
  const saleQuery = new SaleQuery()

  const searchQueryInput: Ref<string> = ref(searchQuery.value)
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

  async function loadItems(page: number = 1) {
    isLoading.value = true

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

    // We load the next page
    if (view &&view["hydra:next"]) {
      await loadItems(page + 1)
      return;
    }

    // No more pages to load

    inventoryItems.value = inventoryItemsLoading.value
    inventoryItemsLoading.value = []
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
      seller: seller.value?.["@id"],
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
        description: error?.message
      });
      return;
    }

    toast.add({
      color: "green",
      title: "Vente enregistrée",
    });

    cartStore.emptyCart()
    saleStore.sales = [] // We empty the listing

    navigateTo('/admin/sales/' + created.id)
  }

  // We load the page content
  loadItems()
  saleStore.getPaymentModes()
  saleStore.getSellers()

  const mobileSideTitle: Ref<string|undefined> = ref(undefined)
  watchEffect(() => {
    mobileSideTitle.value = `Panier (${cartStore.cartTotalItems} `
    if (cartStore.cartTotalItems > 1) {
      mobileSideTitle.value += 'articles'
    } else {
      mobileSideTitle.value += 'article'
    }
    mobileSideTitle.value += ')'
  })
</script>

<template>
  <GenericLayoutContentWithStickySide :mobile-side-title="mobileSideTitle">
    <template #main>
      <UCard class="print:ring-0 print:shadow-none print:!bg-transparent print:text-black">
        <GenericBarcodeReader
          class="mb-4"
          v-model="cameraPreview"
          @decoded="(value) => {searchQuery = value}"
        />

        <div class="flex flex-row items-center mb-4 gap-2 print:hidden">
          <UInput
            class="flex-1"
            v-model="searchQueryInput"
            @update:model-value="searchQueryUpdated()"
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

        <div class="hidden print:block text-right font-extralight text-xs mb-4">À date du {{ formatDate(dayjs().toString()) }}</div>

        <div class="print:columns-2 print:gap-2">
          <div v-for="[title, items] in orderedItems" class="mb-4 print:mb-1 print:break-inside-avoid-column">
            <div class="print:text-base text-xl font-bold mb-2 border-b">{{ title }}</div>
            <div
              v-for="item in items"
              class="flex items-center gap-2 mb-1 hover:bg-neutral-100 dark:hover:bg-gray-800/50 rounded-md"
            >
              <div class="flex-1 flex flex-col">
                <div class="print:text-xs flex-1">{{ item.name }}</div>
                <div v-if="item.sellingQuantity && item.sellingQuantity != 1" class="text-xs font-bold">Vendu par {{ item.sellingQuantity }}</div>
                <div v-if="item.description" class="text-xs print:hidden">{{ item.description }}</div>
              </div>
              <div v-if="item.quantityAlert && item.quantity && item.quantity <= item.quantityAlert"
                   class="print:hidden text-xs font-bold text-red-600">
                Stock restant : {{ item.quantity }}
              </div>
              <div class="text-xs bg-neutral-200 print:!bg-neutral-200 dark:bg-gray-800 p-1 rounded-md">{{ formatMonetary(item.sellingPrice) }}</div>
              <UButton class="print:hidden" icon="i-heroicons-shopping-cart" size="2xs" @click="cartStore.addToCart(item)" />
            </div>
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
          <UForm class="flex gap-2 flex-col" :state="customItemForm" :validate="cartStore.validateCustomCartForm" @submit="cartStore.addCustomItemToCart">
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
              <UButton color="red" variant="ghost" @click="cartStore.closeCustomItemModal()">
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
      <UCard class="print:hidden">
        <div class="text-4xl text-center">{{ formatMonetary(cartTotalPrice) }}</div>
        <div class="mt-4">
          <div class="flex text-xs align-center mt-1">
            <div class="flex-1"></div>
            <UButton v-if="cart.size > 0" size="xs" @click="cartStore.emptyCart()">Vider le panier</UButton>
          </div>
          <div v-if="cart.size < 1" class="text-center">
            <i>Aucun articles</i>
          </div>
          <div class="overflow-y-auto max-h-[25vh] mt-2">
            <div v-for="[id , cartItem] in cart" class="flex items-center gap-2 mb-1">
              <GenericStackedUpDown @changed="modifier => { cartStore.addToCart(cartItem.item, modifier) }" />

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
        </div>
      </UCard>

      <UCard class="print:hidden">
        <UFormGroup label="Vendeur" :error="!seller && 'Un vendeur doit être défini'">
          <UInputMenu v-model="seller" :options="sellers" option-attribute="fullName" :search-attributes="['lastname', 'firstname']" />
        </UFormGroup>

        <UFormGroup label="Commentaire" :error="cartComment.length > 249 && 'Longueur maximum atteinte (250)'" class="my-2">
          <UTextarea v-model="cartComment" :rows="2" autoresize :maxrows="3" placeholder="Commentaire liée à la vente"/>
        </UFormGroup>

        <UFormGroup label="Mode de paiement">
          <div class="flex flex-wrap gap-2">
            <UButton
              v-for="paymentMode in paymentModes"
              :variant="selectedPaymentMode?.id == paymentMode.id ? 'solid' : 'soft'"
              class="basis-[calc(50%-0.25rem)]">
              <div class="flex items-center w-full" @click="selectedPaymentMode = selectedPaymentMode === paymentMode ? null : paymentMode">
                <UIcon :name="'i-heroicons-' + paymentMode.icon" />
                <div class="flex-1">
                  {{ paymentMode.name }}
                </div>
              </div>
            </UButton>
          </div>
        </UFormGroup>

        <UButton :loading="isCreatingSale" class="mt-4" block color="green" :disabled="cart.size < 1 || !selectedPaymentMode || !seller" @click="createSale()">Finaliser la vente</UButton>
      </UCard>
    </template>
  </GenericLayoutContentWithStickySide>
</template>

<style scoped lang="scss">

</style>
