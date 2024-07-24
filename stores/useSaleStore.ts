import type {Sale} from "~/types/api/item/sale";
import type {SalePaymentMode} from "~/types/api/item/salePaymentMode";
import {formatDateInput} from "~/utils/date";
import dayjs from "dayjs";
import SaleQuery from "~/composables/api/query/SaleQuery";
import SalePaymentModeQuery from "~/composables/api/query/SalePaymentModeQuery";

export const useSaleStore = defineStore('sale', () => {
  const saleQuery = new SaleQuery()
  const paymentModeQuery = new SalePaymentModeQuery()

  const isLoading = ref(false)
  const selectedRange: Ref<{ start: Date, end: Date } | null> = ref({start: new Date(), end: new Date()})
  const lastRefreshDate: Ref<Date> = ref(new Date())

  const sales: Ref<Sale[]> = ref([])
  const salesLoading: Ref<Sale[]> = ref([])

  const paymentModes: Ref<SalePaymentMode[]> = ref([])

  async function getSales(page: number = 1) {
    isLoading.value = true

    const urlParams = new URLSearchParams({
      page: page.toString(),
    });

    const formattedStartDate = formatDateInput(selectedRange.value.start.toString())
    const formattedEndDate = formatDateInput(dayjs(selectedRange.value.end).add(1, 'days').toString())
    if (formattedStartDate) {
      urlParams.append(`createdAt[after]`, formattedStartDate);

      if (formattedEndDate) {
        urlParams.append(`createdAt[before]`, formattedEndDate);
      } else {
        urlParams.append(`createdAt[before]`, formattedStartDate);
      }
    }

    const { items, view } = await saleQuery.getAll(urlParams)
    salesLoading.value = salesLoading.value.concat(items)

    // We load the next page
    if (view && view["hydra:next"]) {
      await getSales(page + 1)
      return;
    }

    // No more pages to load
    isLoading.value = false

    sales.value = salesLoading.value
    salesLoading.value = []
    lastRefreshDate.value = new Date()

    // We load the payment modes
    await getPaymentModes()

  }

  async function getPaymentModes() {
    isLoading.value = true
    const { items: paymentModesResponse } = await paymentModeQuery.getAll()
    paymentModes.value = paymentModesResponse
    isLoading.value = false
  }

  return {
    sales,
    paymentModes,

    isLoading,
    selectedRange,
    lastRefreshDate,

    getSales,
  }
})
