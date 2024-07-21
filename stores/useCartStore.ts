import type {ExternalPresence} from "~/types/externalpresence";
import ExternalPresenceQuery from "~/composables/api/query/ExternalPresenceQuery";
import dayjs from "dayjs";
import type {InventoryItem} from "~/types/inventoryItem";
import type {SalePaymentMode} from "~/types/salePaymentMode";
import type {FormError} from "#ui/types";

export const useCartStore = defineStore('cart', () => {
  const searchQuery: Ref<string> = ref('')

  const cart: Ref<Map<string, {item: InventoryItem, quantity: number}>> = ref(new Map())
  const cartTotalItems = computed( () => {
    let total: number = 0
    cart.value.forEach( item => {
      total += item.quantity ?? 0
    } )
    return total
  })
  const cartTotalPrice = computed( () => {
    let total: number = 0
    cart.value.forEach( item => {
      total += item.quantity * Number(item.item.sellingPrice)
    } )
    return !isNaN(total) ? total.toFixed(2) : '0.00'
  } )
  const cartComment = ref('')

  const cartCustomItemModalOpen = ref(false)
  const customItemForm = reactive<{name: string|undefined, sellingPrice: string|undefined}>({
    name: undefined,
    sellingPrice: undefined
  })

  const selectedPaymentMode: Ref<SalePaymentMode | undefined> = ref(undefined)

  // Cart management
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


  // Custom cart item
  function validateCustomCartForm(state: any): FormError[] {
    const errors = []
    if (!state.name) errors.push({ path: 'name', message: 'Champ requis' })
    if (!state.sellingPrice) errors.push({ path: 'sellingPrice', message: 'Champ requis' })
    const sellingPrice = parseFloat(state.sellingPrice)
    if (isNaN(sellingPrice)) errors.push({ path: 'sellingPrice', message: 'Le champ doit être un nombre' })
    return errors
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

	return {
    searchQuery,

    cart,
    cartTotalItems,
    cartTotalPrice,
    cartComment,

    cartCustomItemModalOpen,
    customItemForm,

    selectedPaymentMode,

    addToCart,
    emptyCart,

    validateCustomCartForm,
    addCustomItemToCart,
    closeCustomItemModal,
	}
})
