import type {Sale} from "~/types/api/item/sale";
import type {SalePaymentMode} from "~/types/api/item/salePaymentMode";

export const useSaleStore = defineStore('sale', () => {
  const selectedRange: Ref<{ start: Date, end: Date } | null> = ref({start: new Date(), end: new Date()})

  const sales: Ref<Sale[]> = ref([])
  const paymentModes: Ref<SalePaymentMode[]> = ref([])

  return {
    sales,
    paymentModes,

    selectedRange,
  }
})
