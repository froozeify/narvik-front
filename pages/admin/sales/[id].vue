<script setup lang="ts">
import {formatMonetary} from "~/utils/string";
import type {Sale} from "~/types/sale";
import SaleQuery from "~/composables/api/query/SaleQuery";
import {formatDateTimeReadable} from "~/utils/date";
import {useSelfMemberStore} from "~/stores/useSelfMember";
import dayjs from "dayjs";

definePageMeta({
    layout: "pos"
  })

  useHead({
    title: "Détail vente"
  })

  const selfStore = useSelfMemberStore()
  const isAdmin = selfStore.isAdmin()

  const toast = useToast()
  const route = useRoute()
  const itemId = route.params.id;

  const isLoading = ref(true)

  const sale: Ref<Sale | undefined> = ref(undefined)

  const saleQuery = new SaleQuery()

  const columns = [
    {
      key: 'itemCategory',
      label: 'Catégorie',
      sortable: true
    },
    {
      key: 'itemName',
      label: 'Nom',
      class: 'w-full',
      sortable: true
    },
    {
      key: 'itemPrice',
      label: 'Prix unitaire'
    },
    {
      key: 'total',
      label: 'Total'
    }
  ]

  async function loadSale() {
    isLoading.value = true
    const { retrieved, error } = await saleQuery.get(itemId.toString())
    isLoading.value = false

    if (!retrieved || error) {
      toast.add({
        color: "red",
        title: "Vente non trouvé",
      })

      navigateTo('/admin/sales')
      return
    }

    sale.value = retrieved
  }

  async function deleteSale() {
    if (!sale.value) {
      return
    }

    const { error } = await saleQuery.delete(sale.value)

    if (error) {
      toast.add({
        color: "red",
        title: "La suppression a échouée",
        description: error.message
      })

      return
    }

    navigateTo('/admin/sales')
  }

  // Main code
  loadSale()
  if (isAdmin) {
    columns.push({
      key: 'item',
      label: 'Article'
    })
  }
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex gap-2">
      <UButton
        to="/admin/sales/new"
        icon="i-heroicons-shopping-cart"
        size="xs"
        label="Faire une vente"
      />

      <div class="flex-1 text-center font-bold text-2xl flex justify-center gap-2 ">
        {{ formatDateTimeReadable(sale?.createdAt) }}
      </div>

      <UTooltip v-if="isAdmin || dayjs(dayjs(sale?.createdAt)).isAfter(dayjs().startOf('day'))" text="Supprimer">
        <UPopover>
          <UButton
            icon="i-heroicons-trash"
            color="red"
          />

          <template #panel="{ close }">
            <div class="p-4 w-56 flex flex-col gap-4">
              <div class="text-center text-lg font-bold">Êtes-vous certain ?</div>

              <UButton
                @click="deleteSale(close);"
                color="red"
                class="mx-auto"
              >
                Supprimer
              </UButton>
            </div>
          </template>
        </UPopover>
      </UTooltip>
    </div>

    <div class="sm:grid sm:grid-flow-row sm:gap-4 sm:grid-cols-4">
      <GenericStatCard
        title="Total"
        :value="formatMonetary(sale?.price?.toString())"
        :loading="isLoading">
      </GenericStatCard>

      <GenericStatCard
        title="Articles achetés"
        :value="sale?.salePurchasedItems?.length"
        :loading="isLoading">
      </GenericStatCard>

      <GenericStatCard
        title="Moyen de paiement"
        :value="sale?.paymentMode?.name"
        :top-right="{
          icon: sale?.paymentMode?.icon ? 'i-heroicons-' + sale?.paymentMode?.icon : null
        }"
        :loading="isLoading">
      </GenericStatCard>

      <GenericStatCard
        title="Vendeur"
        :value="sale?.seller?.fullName"
        :loading="isLoading">
      </GenericStatCard>
    </div>
    <UCard>
      <div class="text-xl font-bold">Articles achetés</div>
      <UTable
        class="w-full"
        :loading="isLoading"
        :columns="columns"
        :sort="{
          column: 'itemCategory',
          direction: 'asc'
        }"
        :rows="sale?.salePurchasedItems">
        <template #empty-state>
          <div class="flex flex-col items-center justify-center py-6 gap-3">
            <span class="italic text-sm">Aucun articles.</span>
          </div>
        </template>

        <template #itemCategory-data="{ row }">
          <UButton v-if="row.itemCategory"
                   variant="soft"
                   :ui="{ rounded: 'rounded-full' }">
            {{ row.itemCategory }}
          </UButton>

          <i v-else>
            Pas de catégorie.
          </i>

        </template>

        <template #itemPrice-data="{ row }">
          {{ row.quantity }} x {{ formatMonetary(row.itemPrice) }}
        </template>

        <template #total-data="{ row }">
          {{ formatMonetary(Number(Number(row.itemPrice) * Number(row.quantity)).toFixed(2)) }}
        </template>

        <template #item-data="{ row }">
          <UButton v-if="row.item"
             :to="'/admin/inventories/items/' + row.item.id"
             variant="soft"
             :ui="{ rounded: 'rounded-full' }">
            Voir l'article
          </UButton>
          <i v-else>
            Article non existant
          </i>
        </template>

      </UTable>
    </UCard>
  </div>
</template>

<style scoped lang="scss">

</style>
