<script setup lang="ts">
import {formatMonetary} from "~/utils/string";
import type {Sale} from "~/types/api/item/clubDependent/plugin/sale/sale";
import SaleQuery from "~/composables/api/query/clubDependent/plugin/sale/SaleQuery";
import {formatDateTimeReadable} from "~/utils/date";
import {useSelfUserStore} from "~/stores/useSelfUser";
import dayjs from "dayjs";
import ModalDeleteConfirmation from "~/components/Modal/ModalDeleteConfirmation.vue";
import SaleModalEdit from "~/components/Sale/SaleModalEdit.vue";
import {useSaleStore} from "~/stores/useSaleStore";
import {convertUuidToUrlUuid, decodeUrlUuid} from "~/utils/resource";

definePageMeta({
    layout: "pos"
  })

  useHead({
    title: "Détail vente"
  })

  const saleStore = useSaleStore()
  const selfStore = useSelfUserStore()
  const isAdmin = selfStore.isAdmin()

  const toast = useToast()
  const modal = useModal()
  const route = useRoute()
  const itemId = decodeUrlUuid(route.params.id.toString());

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

      navigateTo('/admin/sales/history')
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

    saleStore.shouldRefreshSales = true
    navigateTo('/admin/sales/history')
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
    <div class="flex flex-col lg:flex-row gap-2">
      <UButton
        to="/admin/sales/new"
        icon="i-heroicons-shopping-cart"
        size="xs"
        label="Faire une vente"
      />

      <div class="flex-1 text-center font-bold text-2xl flex justify-center gap-2 ">
        {{ formatDateTimeReadable(sale?.createdAt) }}
      </div>

      <div v-if="isAdmin || dayjs(dayjs(sale?.createdAt)).isAfter(dayjs().startOf('day'))"
           class="flex justify-between gap-2"
      >
        <UButton v-if="sale"
          icon="i-heroicons-pencil"
          color="yellow"
          size="xs"
          label="Modifier"
          @click="modal.open(SaleModalEdit, {
            sale: sale
          })"
        />

        <UButton
          icon="i-heroicons-trash"
          color="error"
          size="xs"
          label="Supprimer"
          @click="modal.open(ModalDeleteConfirmation, {
            onDelete() {
              modal.close()
              deleteSale()
            }
          })"
        />
      </div>
    </div>

    <div class="sm:grid sm:grid-flow-row sm:gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

    <GenericCard v-if="sale?.comment" title="Commentaire">
      <div class="whitespace-pre-line">
        {{ sale.comment }}
      </div>
    </GenericCard>

    <GenericCard title="Articles achetés">
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
             :to="'/admin/inventories/items/' + convertUuidToUrlUuid(row.item.uuid)"
             variant="soft"
             :ui="{ rounded: 'rounded-full' }">
            Voir l'article
          </UButton>
          <i v-else>
            Article non existant
          </i>
        </template>

      </UTable>
    </GenericCard>
  </div>
</template>

<style scoped lang="css">

</style>
