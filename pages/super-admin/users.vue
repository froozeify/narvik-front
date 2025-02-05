<script lang="ts" setup>
import type {FormError} from "#ui/types";
import ClubQuery from "~/composables/api/query/ClubQuery";
import type {Club, WriteClub} from "~/types/api/item/club";
import type {NuxtError} from "#app";
import {usePaginationValues} from "~/composables/api/list";
import ModalDeleteConfirmation from "~/components/Modal/ModalDeleteConfirmation.vue";
import {useSelfUserStore} from "~/stores/useSelfUser";
import UserQuery from "~/composables/api/query/UserQuery";
import {type User, UserRole} from "~/types/api/item/user";

definePageMeta({
  layout: "super-admin"
});

useHead({
  title: 'Clubs'
})

const toast = useToast()
const modal = useModal()
const apiQuery = new UserQuery();

const selfStore = useSelfUserStore()

const apiItems: Ref<User[]> = ref([])
const isLoading = ref(true);
const apiTotalItems = ref(0)
const selectedItem: Ref<User | undefined> = ref(undefined)

const searchQuery: Ref<string> = ref('')

// Side menu visible
const isVisible = ref(false);
// We watch the selected item so we close the side menu if unselected
watch(selectedItem, (value, oldValue) => {
  isVisible.value = value !== undefined
})

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
const sort = ref({
  column: 'lastname',
  direction: 'asc'
});
const columns = [
  {
    key: 'accountActivated',
    label: 'Activé',
  },
  {
    key: 'fullName',
    label: 'Nom',
    class: 'w-full'
  },
  {
    key: 'email',
    label: 'Email',
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
   urlParams.append('multiple[firstname, lastname, email]', searchQuery.value.trim())
  }

  urlParams.append(`order[${sort.value.column}]`, sort.value.direction);

  const {totalItems, items} = await apiQuery.getAll(urlParams)
  apiItems.value = items
  if (totalItems) {
    apiTotalItems.value = totalItems
  }

  isLoading.value = false
}

function rowClicked(row: User) {
  selectedItem.value = {...row} // We make a shallow clone
  isVisible.value = true
}

async function createItem() {
  let item: User = {
    email: '',
  }
  selectedItem.value = item
}

async function updateItem(item: User) {
  isLoading.value = true

  // We recreate the payload so we don't edit the settings, badgerToken, ...
  let payload: User = {
    email: item.email,
    firstname: item.firstname,
    lastname: item.lastname,
    accountActivated: item.accountActivated,
  }


  // We verify if it's a creation or an update
  let error: NuxtError | undefined = undefined
  if (!item.uuid) {
    await apiQuery.post(payload).then(value => {
      error = value.error
      selectedItem.value = value.created
    });
  } else { // Update
    await apiQuery.patch(item, payload).then(value => {
      error = value.error
    });
  }

  isLoading.value = false

  if (error) {
    toast.add({
      color: "red",
      title: !item.uuid ? "La création a échouée" : "La modification a échouée",
      description: error.message
    });
    return;
  }

  toast.add({
    color: "green",
    title: !item.uuid ? "Utilisateur crée" : "Utilisateur modifié",
  });

  // We refresh the list
  await getItemsPaginated();
}

async function deleteItem() {
  isLoading.value = true
  const {error} = await apiQuery.delete(selectedItem.value)
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
  if (!state.email) errors.push({path: 'email', message: 'Champ requis'})
  return errors
}

async function impersonate(user: User) {
  const impersonated = await selfStore.impersonateUser(user)
  if (!impersonated) {
    console.error('Failed to impersonate.')
    return
  }
}

</script>

<template>
  <GenericLayoutContentWithStickySide @keyup.esc="isVisible = false; selectedItem = undefined;"
                                      :has-side-content="isVisible" :mobile-side-title="selectedItem?.fullName"
                                      tabindex="-1">
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
            :sort="sort"
            :columns="columns"
            :rows="apiItems"
            @select="rowClicked">
            <template #empty-state>
              <div class="flex flex-col items-center justify-center py-6 gap-3">
                <span class="italic text-sm">Aucun utilisateurs.</span>
              </div>
            </template>

            <template #accountActivated-data="{ row }">
              <UToggle :model-value="row.accountActivated" />
            </template>

            <template #actions-data="{ row }">

            </template>

          </UTable>

          <div class="flex justify-end gap-4 px-3 py-3.5 border-t border-gray-200 dark:border-gray-700">
            <USelect v-model="itemsPerPage" :options="usePaginationValues" @update:model-value="getItemsPaginated()"/>
            <UPagination v-model="page" @update:model-value="getItemsPaginated()" :page-count="parseInt(itemsPerPage.toString())" :total="apiTotalItems"/>
          </div>
        </div>
      </UCard>
    </template>

    <template #side>
      <template v-if="selectedItem">
        <UForm :state="selectedItem" @submit="updateItem(selectedItem)" :validate="validate"
               class="flex flex-col gap-4">
          <UCard>
            <div class="flex gap-2 flex-col">
              <UFormGroup v-if="selectedItem.role !== UserRole.SuperAdmin" label="Activé" name="accountActivated">
                <UToggle v-model="selectedItem.accountActivated"/>
              </UFormGroup>
              <UFormGroup label="Email" name="email" required>
                <UInput v-model="selectedItem.email" type="email" />
              </UFormGroup>
              <UFormGroup label="Prénom" name="firstname">
                <UInput v-model="selectedItem.firstname"/>
              </UFormGroup>
              <UFormGroup label="Nom" name="lastname">
                <UInput v-model="selectedItem.lastname"/>
              </UFormGroup>
              <UFormGroup label="Créé le">
                <p class="text-sm">{{ formatDateTimeReadable(selectedItem.createdAt) }}</p>
              </UFormGroup>
              <UFormGroup label="Modifié le">
                <p class="text-sm">{{ formatDateTimeReadable(selectedItem.updatedAt) }}</p>
              </UFormGroup>
            </div>

          </UCard>

          <UButton v-if="selectedItem.uuid && selectedItem.role !== UserRole.SuperAdmin" color="green" block :loading="isLoading" @click="impersonate(selectedItem)">
            Impersonifier
          </UButton>

          <UButton type="submit" block :loading="isLoading">Enregistrer</UButton>

          <UButton
            v-if="selectedItem.uuid && selectedItem.role !== UserRole.SuperAdmin"
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
  </GenericLayoutContentWithStickySide>
</template>
