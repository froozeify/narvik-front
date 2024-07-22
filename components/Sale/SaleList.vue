<script setup lang="ts">
  import SaleQuery from "~/composables/api/query/SaleQuery";
  import {formatMonetary} from "~/utils/string";
  import {formatDateInput, formatDateRangeReadable, formatDateTimeReadable} from "~/utils/date";
  import dayjs from "dayjs";
  import type {Sale} from "~/types/api/item/sale";
  import SalePaymentModeQuery from "~/composables/api/query/SalePaymentModeQuery";
  import type {SalePaymentMode} from "~/types/api/item/salePaymentMode";
  import type {SalePurchasedItem} from "~/types/api/item/salePurchasedItem";

  const props = defineProps({
    perItem: {
      type: Boolean,
      required: false,
      default: false
    },
  })

  const isLoading = ref(true)
  const selectedRange: Ref<{start: Date, end: Date}> = ref({ start: new Date(), end: new Date() })

  const saleQuery = new SaleQuery()
  const paymentModeQuery = new SalePaymentModeQuery()
  const paymentModes: Ref<SalePaymentMode[]> = ref([])

  const sales: Ref<Sale[]> = ref([])
  const salesLoading: Ref<Sale[]> = ref([])
  const totalAmountSales = computed(() => {
    let amount = 0
    sales.value.forEach(sale => {
      amount += Number(sale.price)
    })
    return amount
  })
  const totalPerPaymentMode = computed(() => {
    const amountPerPayment: Map<string, {count: number, amount: number, icon: string}> = new Map()
    paymentModes.value.forEach(paymentMode => {
      if (!paymentMode.name) return
      amountPerPayment.set(paymentMode.name, {
        count: 0,
        amount: 0,
        icon: paymentMode.icon ?? ''
      })
    })

    sales.value.forEach(sale => {
      const paymentModeObject: SalePaymentMode = sale.paymentMode as SalePaymentMode
      if (!sale.paymentMode || !paymentModeObject.name) { return }

      let paymentMode = amountPerPayment.get(paymentModeObject.name)
      if (!paymentMode) {
        return;
      }

      paymentMode.count += 1
      paymentMode.amount += Number(sale.price)
      amountPerPayment.set(paymentModeObject.name, paymentMode)
    })
    return amountPerPayment
  })

  getSales() // We load the default setting
  watch(selectedRange, () => {
    getSales()
  })

  async function getSales(page: number = 1) {
    isLoading.value = true

    if (page === 1) {
      salesLoading.value = []
    }

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

    if (view &&view["hydra:next"]) {
      await getSales(page + 1)
      return;
    }

    sales.value = salesLoading.value

    // We load the payment modes
    const { items: paymentModesResponse } = await paymentModeQuery.getAll()
    paymentModes.value = paymentModesResponse

    isLoading.value = false
  }

  function getPerItems() {
    let items: Map<string, { item: SalePurchasedItem, paymentModesCount: Map<string, { count: number, amount: number }> }> = new Map()
    const paymentModeDefaultMap = new Map<string, { count: number, amount: number }>()
    paymentModes.value.forEach((paymentMode) => {
      if (!paymentMode.name) return
      paymentModeDefaultMap.set(paymentMode.name, { count: 0, amount: 0})
    })

    sales.value.forEach((sale) => {
      if (
        !sale.salePurchasedItems
        || !sale.paymentMode
        || typeof sale.paymentMode == 'string'
      ) {
        return
      }

      const salePaymentMode = sale.paymentMode.name
      if (!salePaymentMode) return

      // We loop through each purchases
      sale.salePurchasedItems.forEach((salePurchasedItem) => {
        if (
          !salePurchasedItem.id
          || !salePurchasedItem.itemPrice
        ) {
          return
        }

        let salePurchasedItemMap = items.get(salePurchasedItem.id.toString())

        if (!salePurchasedItemMap) {
          salePurchasedItemMap = {
            item: salePurchasedItem,
            paymentModesCount: paymentModeDefaultMap
          }
        }

        // We update the item count
        let mappedPaymentMode = salePurchasedItemMap.paymentModesCount.get(salePaymentMode)
        if (!mappedPaymentMode) return

        mappedPaymentMode.count += 1
        mappedPaymentMode.amount += Number(salePurchasedItem.itemPrice)
        salePurchasedItemMap.paymentModesCount.set(salePaymentMode, mappedPaymentMode)

        items.set(salePurchasedItem.id.toString(), salePurchasedItemMap)
      })
    })

    const array = Array.from(items.values()).sort((a, b) => {
      const aCategory = a.item.itemCategory ?? '00'
      const bCategory = b.item.itemCategory ?? '00'
      return aCategory.toLowerCase() > bCategory.toLowerCase() ? 1 : -1
    })

    return array
  }

</script>

<template>
  <div class="flex flex-col gap-4">
    <UPopover :popper="{ placement: 'bottom-start' }" class="self-center">
      <UButton icon="i-heroicons-calendar-days-20-solid" :label="selectedRange ? formatDateRangeReadable(selectedRange) || 'Choisir une plage' : 'Choisir une plage'" />

      <template #panel="{ close }">
        <GenericDateRangePicker v-model="selectedRange" />
      </template>
    </UPopover>

    <div class="sm:grid sm:grid-flow-row sm:gap-4 sm:grid-cols-2">
      <GenericStatCard
        title="Nombres de ventes"
        :value="sales.length"
        :loading="isLoading">
      </GenericStatCard>

      <GenericStatCard
        title="Total"
        :value="formatMonetary(totalAmountSales.toFixed(2))"
        :loading="isLoading">
      </GenericStatCard>
    </div>

    <div class="sm:flex sm:gap-4 sm:justify-center sm:flex-wrap">
      <GenericStatCard
        class="basis-[calc(25%-1rem)]"
        v-for="[name, value] in totalPerPaymentMode"
        :title="name"
        :is-increasing="true"
        :value="formatMonetary(value.amount.toFixed(2))"
        :top-right="{
          value: value.count.toString(),
          tooltip: value.count + ' ventes en ' + name,
          icon: value.icon ? 'i-heroicons-' + value.icon : null
        }"
        :loading="isLoading">
      </GenericStatCard>
    </div>

    <template v-if="props.perItem">
      <div class="flex flex-col gap-4 xl:grid xl:grid-flow-row xl:grid-cols-4">
        <UCard v-for="itemMap in getPerItems()">
          <div class="flex flex-col gap-2">
            <div class="text-center">
              <UButton v-if="itemMap.item.itemCategory"
                       variant="soft"
                       :ui="{ rounded: 'rounded-full' }"
              >
                {{ itemMap.item.itemCategory }}
              </UButton>
            </div>

            <div class="text-xl font-bold text-center">{{ itemMap.item.itemName }}</div>

            <div v-for="[name, pmMap] in itemMap.paymentModesCount">
              {{ name }} : {{ pmMap.count }} - {{ formatMonetary(pmMap.amount) }}
            </div>
          </div>
        </UCard>
      </div>
    </template>
    <template v-else>
      <UCard>
        <div class="text-xl font-bold">Ventes</div>
        <UTable
          class="w-full"
          :loading="isLoading"
          :columns="[
          {
            key: 'createdAt',
            label: 'Date',
            class: 'w-40',
            sortable: true
          },
          {
            key: 'paymentMode.name',
            label: 'Moyen de paiement',
            class: 'w-48',
            sortable: true
          },
          {
            key: 'price',
            label: 'Montant',
          },
          {
            key: 'comment',
            label: 'Commentaire'
          },
          {
            key: 'id',
            label: 'Détail'
          }
        ]"
          :sort="{
          column: 'date',
          direction: 'desc'
        }"
          :rows="sales">
          <template #empty-state>
            <div class="flex flex-col items-center justify-center py-6 gap-3">
              <span class="italic text-sm">Aucun articles.</span>
            </div>
          </template>

          <template #createdAt-data="{ row }">
            {{ formatDateTimeReadable(row.createdAt) }}
          </template>

          <template #price-data="{ row }">
            {{ formatMonetary(row.price) }}
          </template>

          <template #total-data="{ row }">
            {{ formatMonetary(Number(Number(row.itemPrice) * Number(row.quantity)).toFixed(2)) }}
          </template>

          <template #id-data="{ row }">
            <UButton
              :to="'/admin/sales/' + row.id"
              variant="soft"
              :ui="{ rounded: 'rounded-full' }">
              Voir le détail
            </UButton>
          </template>

        </UTable>
      </UCard>
    </template>
  </div>
</template>

<style scoped lang="scss">

</style>
