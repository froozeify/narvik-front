<script setup lang="ts">
  import InventoryItemQuery from "~/composables/api/query/InventoryItemQuery";
  import type {InventoryItem} from "~/types/inventoryItem";
  import type {InventoryItemHistory} from "~/types/inventoryItemHistory";

  import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Colors } from 'chart.js'
  import { Line} from 'vue-chartjs'
  ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Colors)

  definePageMeta({
    layout: "pos"
  });

  const isLoading = ref(true)

  const toast = useToast()
  const route = useRoute()
  const itemId = route.params.id;

  const inventoryItemModalOpen = ref(false)

  const inventoryItem: Ref<InventoryItem | undefined> = ref(undefined)
  const inventoryItemHistories: Ref<InventoryItemHistory[]> = ref([])

  const chartData: Ref<object|undefined> = ref(undefined)
  const chartOptions = ref({
    responsive: true,
    maintainAspectRatio: true,
  })

  const itemQuery = new InventoryItemQuery()

  // We load the item
  loadItem().then(value => {
    if (!value) {
      toast.add({
        color: "red",
        title: "Produit non trouvé",
      })

      navigateTo('/admin/inventories')
    }
  })

  async function loadItem(): Promise<boolean> {
    isLoading.value = true
    const { retrieved, error } = await itemQuery.get(itemId.toString())
    isLoading.value = false

    if (!retrieved || error) {
      return false
    }

    inventoryItem.value = retrieved

    // We update the page title
    useHead({
      title: retrieved.name
    })

    loadHistories(itemId.toString())

    return true
  }

  async function loadHistories(itemId: string) {
    // We load the history
    const { items, error } = await itemQuery.histories(itemId.toString())

    if (error) {
      inventoryItemHistories.value = []
      return;
    }

    inventoryItemHistories.value = items



    let labels: string[] = [];
    let dataPurchasePrice: string[] = [];
    let dataSellingPrice: string[] = [];

    items.reverse().forEach(value => {
      labels.push(formatDateTime(value.createdAt) ?? '')
      dataPurchasePrice.push(value.purchasePrice ?? '')
      dataSellingPrice.push(value.sellingPrice ?? '')
    })

    chartData.value = {
      labels: labels,
      datasets: [
        {
          label: 'Prix d\'achat',
          data: dataPurchasePrice
        },
        {
          label: 'Prix de vente',
          data: dataSellingPrice
        }
      ]
    }
  }

  async function deleteItem(close: Function) {
    if (!inventoryItem.value) return

    const { error } = await itemQuery.delete(inventoryItem.value)

    if (error) {
      toast.add({
        color: "red",
        title: "La suppression a échouée",
        description: error.message
      })

      return
    }

    toast.add({
      color: "green",
      title: "Produit supprimé",
    })
    close()
    navigateTo('/admin/inventories')
  }
</script>

<template>
  <div id="wrapper" class="flex flex-col gap-4">
    <div class="flex gap-2">
      <UTooltip text="Inventaire">
        <UButton
          to="/admin/inventories"
          icon="i-heroicons-arrow-left"
          size="xs"
          variant="ghost"
        />
      </UTooltip>

      <div class="flex-1 text-center font-bold text-2xl flex justify-center gap-2 ">
        {{ inventoryItem?.name }}

        <UButton v-if="inventoryItem?.category"
           :to="'/admin/inventories?category=' + inventoryItem.category.id"
           variant="soft"
           :ui="{ rounded: 'rounded-full' }">
          {{ inventoryItem.category.name }}
        </UButton>
      </div>

      <UTooltip text="Modifier">
        <UButton
          icon="i-heroicons-pencil-square"
          color="yellow"
          @click="inventoryItemModalOpen = true"
        />
      </UTooltip>

      <UTooltip text="Supprimer">
        <UPopover>
          <UButton
            icon="i-heroicons-trash"
            color="red"
          />

          <template #panel="{ close }">
            <div class="p-4 w-56 flex flex-col gap-4">
              <div class="text-center text-lg font-bold">Êtes-vous certain ?</div>

              <UButton
                @click="deleteItem(close);"
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
        title="Prix d'achat"
        :value="inventoryItem?.purchasePrice ? inventoryItem.purchasePrice.replace('.', ',') + ' €' : 'Non défini'"
        :loading="isLoading">
      </GenericStatCard>

      <GenericStatCard
        title="Prix de vente"
        :value="inventoryItem?.sellingPrice ? inventoryItem.sellingPrice.replace('.', ',') + ' €' : 'Non défini'"
        :loading="isLoading">
      </GenericStatCard>

      <GenericStatCard
        title="En stock"
        :value="inventoryItem?.quantity ?? '∞' "
        :loading="isLoading">
      </GenericStatCard>

      <GenericStatCard
        :title="inventoryItem?.canBeSold ? 'Vente activée' : 'Vente désactivée' "
        :value-class="inventoryItem?.canBeSold ? 'text-green-600' : 'text-red-600'"
        :value="inventoryItem?.canBeSold ? '✔' : '✖' "
        :loading="isLoading">
      </GenericStatCard>
    </div>

    <UCard v-if="chartData">
      <div class="text-xl font-bold">Historique des prix de ventes/achats</div>
      <Line
        :data="chartData"
        :options="chartOptions"
      />
    </UCard>
  </div>

  <UModal
    v-model="inventoryItemModalOpen">
    <UCard>
      <InventoryItemForm
        :item="inventoryItem ? {...inventoryItem} : undefined"
        @updated="(value) => {inventoryItemModalOpen = false; loadItem() }"
      />
    </UCard>
  </UModal>

</template>

<style scoped lang="scss">

</style>
