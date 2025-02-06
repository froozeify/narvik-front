<script lang="ts" setup>
  import type {FormError} from "#ui/types";
  import ClubQuery from "~/composables/api/query/ClubQuery";
  import type {Club, WriteClub} from "~/types/api/item/club";
  import type {NuxtError} from "#app";
  import {usePaginationValues} from "~/composables/api/list";
  import ModalDeleteConfirmation from "~/components/Modal/ModalDeleteConfirmation.vue";
  import {useSelfUserStore} from "~/stores/useSelfUser";
  import {formatDateReadable, formatDateTimeReadable} from "~/utils/date";
  import SaleModalEdit from "~/components/Sale/SaleModalEdit.vue";
  import ModalClubSelectRenewDate from "~/components/Modal/Club/ModalClubSelectRenewDate.vue";
  import dayjs from "dayjs";

  definePageMeta({
    layout: "super-admin"
  });

  useHead({
    title: 'Clubs'
  })

  const toast = useToast()
  const modal = useModal()
  const apiQuery = new ClubQuery();

  const selfStore = useSelfUserStore()

  const apiItems: Ref<Club[]> = ref([])
  const isLoading = ref(true);
  const apiTotalItems = ref(0)
  const selectedItem: Ref<WriteClub | undefined> = ref(undefined)

  const searchQuery: Ref<string> = ref('')

  // Side menu visible
  const isSideVisible = ref(false);

  let inputTimer: NodeJS.Timeout;
  async function searchQueryUpdated() {
    clearTimeout(inputTimer);
    inputTimer = setTimeout(async () => {
      page.value = 1;
      await getItemsPaginated()
    }, 500);
  }

  // Table settings
  const page = ref(1);
  const itemsPerPage = ref(30);
  const columns = [
    {
      key: 'isActivated',
      label: 'Activé'
    },
    {
      key: 'name',
      label: 'Nom',
    },
    {
      key: 'renewDate',
      label: 'Renouvellement'
    },
    {
      key: 'comment',
      label: 'Commentaire',
      class: 'w-full'
    },
    {
      key: 'actions',
    }
  ]

  // We get the data from the api on first page load
  getItemsPaginated()

  async function getItemsPaginated() {
    isLoading.value = true

    const urlParams = new URLSearchParams({
      page: page.value.toString(),
      itemsPerPage: itemsPerPage.value.toString(),
    });

    if (searchQuery.value.trim().length > 0) {
      urlParams.append('multiple[name]', searchQuery.value.trim())
    }

    urlParams.append(`order[renewDate]`, 'ASC');
    urlParams.append(`order[isActivated]`, 'ASC');
    urlParams.append(`order[name]`, 'ASC');

    const { totalItems, items } = await apiQuery.getAll(urlParams)
    apiItems.value = items
    if (totalItems) {
      apiTotalItems.value = totalItems
    }

    isLoading.value = false
  }

  function rowClicked(row: Club) {
    selectedItem.value = {...row} // We make a shallow clone
    isSideVisible.value = true
  }

  async function createItem() {
    let item: WriteClub = {
      name: '',
      isActivated: true,
      salesEnabled: true
    }
    selectedItem.value = item
    isSideVisible.value = true
  }

  async function updateItem(item: WriteClub) {
    isLoading.value = true

    // We recreate the payload so we don't edit the settings, badgerToken, ...
    let payload: WriteClub = {
      name: item.name,
      renewDate: item.renewDate,
      salesEnabled: item.salesEnabled,
      isActivated: item.isActivated,
      comment: item.comment
    }


    // We verify if it's a creation or an update
    let apiError: NuxtError | undefined = undefined
    if (!item.uuid) {
      const {error, created} = await apiQuery.post(payload);
      apiError = error
      selectedItem.value = created
    } else { // Update
      const {error, updated} = await apiQuery.patch(item, payload);
      apiError = error
      selectedItem.value = updated
    }

    isLoading.value = false
    isSideVisible.value = false

    if (apiError) {
      toast.add({
        color: "red",
        title: !item.uuid ? "La création a échouée" : "La modification a échouée",
        description: apiError.message
      });
      return;
    }

    toast.add({
      color: "green",
      title: !item.uuid ? "Club crée" : "Club modifié",
    });

    // We refresh the list
    await getItemsPaginated();
  }

  async function deleteItem() {
    isLoading.value = true
    const { error } = await apiQuery.delete(selectedItem.value)
    isLoading.value = false

    if (error) {
      toast.add({
        color: "red",
        title: "La suppression a échouée",
        description: error.message
      });
      return;
    }

    selectedItem.value = undefined
    // We refresh the list
    await getItemsPaginated();
  }

  const validate = (state: any): FormError[] => {
    const errors = []
    if (!state.name) errors.push({ path: 'name', message: 'Champ requis' })
    return errors
  }

  async function impersonate(club: Club) {
    const impersonated = await selfStore.impersonateClub(club)
    if (!impersonated) {
      console.error('Failed to impersonate.')
      return
    }
    navigateTo('/admin')
  }
</script>

<template>
  <GenericLayoutContentWithSlideover v-model="isSideVisible" tabindex="-1">
    <template #main>
      <UCard>
        <div>
          <div class="flex gap-4">
            <UInput
              v-model="searchQuery"
              @update:model-value="searchQueryUpdated()"
              placeholder="Rechercher..."
              :ui="{ icon: { trailing: { pointer: '' } } }"
            >
              <template #trailing v-if="searchQuery">
                <UIcon
                  v-if="searchQuery"
                  class="cursor-pointer"
                  name="i-heroicons-x-mark"
                  @click="searchQuery = ''; getItemsPaginated()"
                />
              </template>
            </UInput>

            <div class="flex-1"></div>

            <UButton @click="createItem" icon="i-heroicons-plus"/>

          </div>

          <UTable
            class="w-full"
            :loading="isLoading"
            :columns="columns"
            :rows="apiItems"
            @select="rowClicked">
            <template #empty-state>
              <div class="flex flex-col items-center justify-center py-6 gap-3">
                <span class="italic text-sm">Aucun club.</span>
              </div>
            </template>

            <template #isActivated-data="{ row }">
              <UToggle :model-value="row.isActivated" />
            </template>

            <template #name-data="{ row }">
              {{ row.name }}
            </template>

            <template #renewDate-data="{ row }">
              <p :class="dayjs().isAfter(dayjs(row.renewDate).subtract(14, 'days')) ? 'text-red-500 font-bold' : ''">{{ formatDateReadable(row.renewDate) }}</p>
            </template>

            <template #actions-data="{ row }">

            </template>

          </UTable>

          <div class="flex justify-end gap-4 px-3 py-3.5 border-t border-gray-200 dark:border-gray-700">
            <USelect v-model="itemsPerPage" :options="usePaginationValues" @update:model-value="getItemsPaginated()" />
            <UPagination v-model="page" @update:model-value="getItemsPaginated()" :page-count="parseInt(itemsPerPage.toString())" :total="apiTotalItems" />
          </div>
        </div>
      </UCard>
    </template>

    <template #side>
      <template v-if="selectedItem">
        <UButton v-if="selectedItem.uuid" class="mb-4" color="yellow" block :loading="isLoading" @click="impersonate(selectedItem)">Impersonifier</UButton>

        <UForm :state="selectedItem" @submit="updateItem(selectedItem)" :validate="validate" class="flex flex-col gap-4">
          <UCard>
            <div class="flex gap-2 flex-col relative">
              <UFormGroup label="Date de renouvellement" name="renewDate">
                <UButton
                  icon="i-heroicons-calendar-days-20-solid"
                  :label="formatDateReadable(selectedItem.renewDate?.toString()) || 'Choisir une date'"
                  @click="isSideVisible = false; modal.open(ModalClubSelectRenewDate, {
                    item: selectedItem,
                    onSelected(date: Date|undefined) {
                      if (selectedItem) {
                        selectedItem.renewDate = date
                        if (selectedItem.uuid) {
                          updateItem(selectedItem)
                        } else {
                          isSideVisible = true // We reopen the slide
                        }
                      }
                    }
                  })"
                />
              </UFormGroup>
              <UFormGroup label="Activé" name="isActivated">
                <UToggle v-model="selectedItem.isActivated" />
              </UFormGroup>
              <UFormGroup label="Nom" name="name" required>
                <UInput v-model="selectedItem.name" />
              </UFormGroup>
              <UFormGroup label="Vente" name="salesEnabled">
                <UToggle v-model="selectedItem.salesEnabled" />
              </UFormGroup>
              <UFormGroup label="Commentaire" :error="selectedItem.comment ? (selectedItem.comment.length > 249 && 'Longueur maximum atteinte (250)') : ''">
                <UTextarea v-model="selectedItem.comment" :rows="2" autoresize :maxrows="3" placeholder="Commentaire"/>
              </UFormGroup>
              <GenericItemTimestampInfo :item="selectedItem" />
            </div>

          </UCard>

          <UButton type="submit" block :loading="isLoading">Enregistrer</UButton>

          <UButton
            v-if="selectedItem.uuid"
            block
            color="red"
            :loading="isLoading"
            @click="modal.open(ModalDeleteConfirmation, {
              onDelete() {
                modal.close()
                deleteItem()
              }
            })"
          >
            Supprimer
          </UButton>
        </UForm>

      </template>
    </template>
  </GenericLayoutContentWithSlideover>
</template>
