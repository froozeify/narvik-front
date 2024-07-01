<script setup lang="ts">
  import InventoryItemQuery from "~/composables/api/query/InventoryItemQuery";
  import type {Inventoryitem} from "~/types/inventoryitem";

  definePageMeta({
    layout: "pos"
  });

  const isLoading = ref(true)

  const toast = useToast()
  const route = useRoute()
  const itemId = route.params.id;

  const inventoryItem: Ref<Inventoryitem | null> = ref(null)

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
    const { retrieved } = await itemQuery.get(itemId.toString())
    isLoading.value = false

    if (!retrieved) {
      return false
    }

    inventoryItem.value = retrieved

    // We update the page title
    useHead({
      title: retrieved.name
    })

    return true
  }
</script>

<template>
  <div id="wrapper" class="flex flex-col gap-4">
    <div class="flex relative">
      <UTooltip text="Inventaire" class="absolute left-0">
        <UButton
          @click="navigateTo('/admin/inventories')"
          icon="i-heroicons-arrow-left"
          size="xs"
          variant="ghost"
        />
      </UTooltip>

      <div class="flex-1 text-center font-bold text-2xl">{{ inventoryItem?.name }}</div>
    </div>

    <div class="sm:grid sm:grid-flow-row sm:gap-4 sm:grid-cols-4">

      <GenericStatCard
        title="Prix d'achat"
        :value="inventoryItem?.purchasePrice + '€'"
        :loading="isLoading">
      </GenericStatCard>

      <GenericStatCard
        title="Prix de vente"
        :value="inventoryItem?.sellingPrice + '€'"
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

    <UCard class="mt-4">
      <div class="text-xl font-bold">Formulaire pour modifier le prix / nom</div>
    </UCard>

    <UCard class="mt-4">
      <div class="text-xl font-bold">Historique des prix de vente/achat en graph</div>
    </UCard>
  </div>
</template>

<style scoped lang="scss">

</style>
