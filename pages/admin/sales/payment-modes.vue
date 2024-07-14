<script setup lang="ts">
import type {InventoryCategory} from "~/types/inventorycategory";
import {usePaginationValues} from "~/composables/api/list";
import SalePaymentModeQuery from "~/composables/api/query/SalePaymentModeQuery";
import type {SalePaymentMode} from "~/types/salePaymentMode";

definePageMeta({
    layout: "pos"
  });

  useHead({
    title: 'Moyen de paiement'
  })

  const toast = useToast()
  const apiQuery = new SalePaymentModeQuery()

  const paymentModes: Ref<SalePaymentMode[]> = ref([])
  const isLoading = ref(true);
  const totalPaymentModes = ref(0)
  const selectedPaymentMode: Ref<SalePaymentMode | null> = ref(null)

  // Side menu visible
  const isVisible = ref(false);
  // We watch the selected item so we close the side menu if unselected
  watch(selectedPaymentMode, (value, oldValue) => {
    isVisible.value = value !== null
  })

  // Table settings
  const page = ref(1);
  const itemsPerPage = ref(30);
  const sort = ref({
    column: 'weight',
    direction: 'asc'
  });
  const columns = [
    {
      key: 'name',
      label: 'Nom'
    },
    {
      key: 'icon',
      label: 'Icône',
      class: 'w-full'
    },
    {
      key: 'actions',
    }
  ]

  // We get the data from the api on first page load
  getPaymentModesPaginated()

  async function getPaymentModesPaginated() {
    isLoading.value = true

    const urlParams = new URLSearchParams({
      pagination: '1',
      page: page.value.toString(),
      itemsPerPage: itemsPerPage.value.toString(),
    });

    urlParams.append(`order[${sort.value.column}]`, sort.value.direction);

    const { totalItems, items } = await apiQuery.getAll(urlParams)
    paymentModes.value = items
    if (totalItems) {
      totalPaymentModes.value = totalItems
    }

    isLoading.value = false
  }

  function rowClicked(row: object) {
    selectedPaymentMode.value = {...row} // We make a shallow clone
    isVisible.value = true
  }

  async function move(row: InventoryCategory, modifier: number) {
    isLoading.value = true
    const { error } = await apiQuery.move(row, modifier === 1 ? 'down' : 'up');
    isLoading.value = false

    if (error) {
      toast.add({
        color: "red",
        title: "La modification a échouée",
        description: error.message
      });
      return;
    }

    // We refresh the list
    await getPaymentModesPaginated();
  }

  async function createPaymentMode() {
    selectedPaymentMode.value = {
      name: '',
      icon: ''
    }
  }

  async function updatePaymentMode(paymentMode: SalePaymentMode) {
    isLoading.value = true
    let payload: SalePaymentMode = {
      name: paymentMode.name,
      icon: paymentMode.icon
    }

    // We verify if it's a creation or an update
    let error: Error | null = null
    if (!paymentMode.id) {
      await apiQuery.post(payload).then(value => {
        error = value.error
        selectedPaymentMode.value = null
      });
    } else { // Update
      await apiQuery.patch(paymentMode, payload).then(value => {
        error = value.error
      });
    }

    isLoading.value = false

    if (error) {
      toast.add({
        color: "red",
        title: !paymentMode.id ? "La création a échouée" : "La modification a échouée",
        description: error.message
      });
      return;
    }

    toast.add({
      color: "green",
      title: !paymentMode.id ? "Moyen de paiement crée" : "Moyen de paiement modifié",
    });

    // We refresh the list
    await getPaymentModesPaginated();
  }

  async function deletePaymentMode(close: Function) {
    isLoading.value = true
    const { error } = await apiQuery.delete(selectedPaymentMode.value)
    isLoading.value = false
    close()

    if (error) {
      toast.add({
        color: "red",
        title: "La suppression a échouée",
        description: error.message
      });
      return;
    }

    selectedPaymentMode.value = null
    // We refresh the list
    await getPaymentModesPaginated();
  }

</script>

<template>
  <GenericLayoutContentWithStickySide @keyup.esc="isVisible = false; selectedPaymentMode = null;" tabindex="-1">
    <template #main>
      <UCard>

        <div class="flex gap-4">

          <div class="flex-1"></div>
          <UButton @click="createPaymentMode" >
            Créer un mode de paiement
          </UButton>
        </div>

        <UTable
          class="w-full"
          :loading="isLoading"
          :sort="sort"
          :columns="columns"
          :rows="paymentModes"
          @select="rowClicked">
          <template #empty-state>
            <div class="flex flex-col items-center justify-center py-6 gap-3">
              <span class="italic text-sm">Aucun moyen de paiement.</span>
            </div>
          </template>

          <template #name-data="{ row }">
            {{ row.name }}
          </template>


          <template #icon-data="{ row }">
            <UIcon :name="'i-heroicons-' + row.icon" dynamic />
          </template>

          <template #actions-data="{ row }">
            <GenericStackedUpDown @changed="modifier => { move(row, -modifier) }" />
          </template>

        </UTable>

        <div class="flex justify-end gap-4 px-3 py-3.5 border-t border-gray-200 dark:border-gray-700">
          <USelect v-model="itemsPerPage" :options="usePaginationValues" @update:model-value="getPaymentModesPaginated()" />
          <UPagination v-model="page" @update:model-value="getPaymentModesPaginated()" :page-count="parseInt(itemsPerPage.toString())" :total="totalPaymentModes" />
        </div>

      </UCard>
    </template>

    <template #side>
      <template v-if="selectedPaymentMode">
        <UCard class="overflow-y-auto">

          <div class="flex gap-2 flex-col">
            <UFormGroup label="Nom" :error="!selectedPaymentMode.name && 'Champ requis'">
              <UInput v-model="selectedPaymentMode.name" />
            </UFormGroup>

            <UFormGroup
              label="Icône"
              :error="!selectedPaymentMode.icon && 'Champ requis'">

              <template #description>
                <UButton variant="link" to="https://heroicons.com/" target="_blank" :padded="false">Liste des icônes Heroicons</UButton>
                <ul class="text-xs">
                  <li>Espèces : <code>banknotes</code></li>
                  <li>Chèque : <code>ticket</code></li>
                  <li>Carte : <code>credit-card</code></li>
                </ul>
              </template>

              <template #hint>
                <UIcon :name="'i-heroicons-' + selectedPaymentMode.icon" dynamic />
              </template>

              <UInput v-model="selectedPaymentMode.icon" />

            </UFormGroup>
          </div>

        </UCard>

        <UButton block :loading="isLoading" @click="updatePaymentMode(selectedPaymentMode)">Enregistrer</UButton>

        <UPopover v-if="selectedPaymentMode.id">
          <UButton
            color="red" block
            :loading="isLoading"
          >
            Supprimer
          </UButton>

          <template #panel="{ close }">
            <div class="p-4 w-56 flex flex-col gap-4">
              <div class="text-center text-lg font-bold">Êtes-vous certain ?</div>

              <UButton
                @click="deletePaymentMode(close)"
                color="red"
                class="mx-auto"
              >
                Supprimer
              </UButton>
            </div>
          </template>
        </UPopover>

      </template>
    </template>
  </GenericLayoutContentWithStickySide>
</template>

<style scoped lang="scss">

</style>
