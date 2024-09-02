<script setup lang="ts">
import {formatMonetary} from "~/utils/string";
import {formatDateRangeReadable, formatDateTimeReadable} from "~/utils/date";
import type {SalePaymentMode} from "~/types/api/item/salePaymentMode";
import {useSaleStore} from "~/stores/useSaleStore";

const props = defineProps({
    perItem: {
      type: Boolean,
      required: false,
      default: false
    },
  })

  const saleStore = useSaleStore()
  const { selectedRange, isLoading, lastRefreshDate, sales, paymentModes } = storeToRefs(saleStore)


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

  if (sales.value.length == 0 || saleStore.shouldRefreshSales) {
    saleStore.getSales() // We load the default setting
  }
  watch(selectedRange, () => {
    saleStore.getSales()
  })

</script>

<template>
  <div class="flex flex-col gap-4 relative">
    <div class="flex flex-wrap justify-center">
      <UButton
        color="gray"
        variant="ghost"
        size="2xs"
        icon="i-heroicons-arrow-path"
        :loading="isLoading"
        @click="saleStore.getSales()"
      >
        Dernière mise à jour : {{ formatDateTimeReadable(lastRefreshDate) }}
      </UButton>

      <div class="w-full mb-2"></div>

      <UPopover :popper="{ placement: 'bottom-start' }" class="">
        <UButton icon="i-heroicons-calendar-days-20-solid" :label="selectedRange ? formatDateRangeReadable(selectedRange) || 'Choisir une plage' : 'Choisir une plage'" />

        <template #panel="{ close }">
          <GenericDateRangePicker v-model="selectedRange" @close="close" />
        </template>
      </UPopover>

    </div>


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
      <SalePerItemList :is-loading="isLoading" />
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
