<script setup lang="ts">
  import InventoryItemQuery from "~/composables/api/query/InventoryItemQuery";
  import type {InventoryItem} from "~/types/inventoryItem";
  import type {InventoryItemHistory} from "~/types/inventoryItemHistory";

  import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Colors } from 'chart.js'
  import { Line} from 'vue-chartjs'
  import {formatMonetary} from "~/utils/string";

  definePageMeta({
    layout: "pos"
  });

  const isLoading = ref(true)

  const toast = useToast()
  const route = useRoute()
  const itemId = route.params.id;


  // const inventoryItem: Ref<InventoryItem | undefined> = ref(undefined)
  // const inventoryItemHistories: Ref<InventoryItemHistory[]> = ref([])

  // const itemQuery = new InventoryItemQuery()

  // We load the item
  // loadItem().then(value => {
  //   if (!value) {
  //     toast.add({
  //       color: "red",
  //       title: "Produit non trouvé",
  //     })
  //
  //     navigateTo('/admin/inventories')
  //   }
  // })

  async function loadSale() {
    isLoading.value = true
    const { retrieved, error } = await itemQuery.get(itemId.toString())
    isLoading.value = false

    if (!retrieved || error) {
      return false
    }

    // inventoryItem.value = retrieved

    // We update the page title
    useHead({
      title: retrieved.name
    })
  }
</script>

<template>
  Plop

</template>

<style scoped lang="scss">

</style>
