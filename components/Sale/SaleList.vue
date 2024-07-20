<script setup lang="ts">
  import SaleQuery from "~/composables/api/query/SaleQuery";
  import {formatMonetary} from "~/utils/string";
  import {formatDateInput, formatDateRangeReadable, formatDateTimeReadable} from "~/utils/date";
  import dayjs from "dayjs";
  import type {Sale} from "~/types/sale";

  const props = defineProps({
    today: {
      type: Boolean,
      required: false,
      default: false
    },
  })

  const isLoading = ref(true)
  const selectedRange: Ref<{start: Date, end: Date}> = props.today ? ref({ start: new Date(), end: new Date() }) : ref({ start: dayjs().subtract(30, 'day').toDate(), end: new Date() })

  const saleQuery = new SaleQuery()
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
    let amountPerPayment = {}
    sales.value.forEach(sale => {
      if (sale.paymentMode?.name) {
        amountPerPayment[sale.paymentMode.name] = amountPerPayment[sale.paymentMode.name] ? amountPerPayment[sale.paymentMode.name] + Number(sale.price) : Number(sale.price)
      }
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

    isLoading.value = false
  }

</script>

<template>
  <div class="flex flex-col gap-4">
    <UPopover :popper="{ placement: 'bottom-start' }" class="self-center">
      <UButton icon="i-heroicons-calendar-days-20-solid" :label="selectedRange ? formatDateRangeReadable(selectedRange) || 'Choisir une plage' : 'Choisir une plage'" />

      <template #panel="{ close }">
        <GenericDateRangePicker v-if="!props.today" v-model="selectedRange" />
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

      <GenericStatCard
        v-for="(value, name) in totalPerPaymentMode"
        :title="name"
        :value="formatMonetary(value.toFixed(2))"
        :loading="isLoading">
      </GenericStatCard>
    </div>

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
            Voir la vente
          </UButton>
        </template>

      </UTable>
    </UCard>
  </div>
</template>

<style scoped lang="scss">

</style>
