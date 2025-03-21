<script lang="ts" setup>
import type {FormError} from "#ui/types";
import type {NuxtError} from "#app";
import {usePaginationValues} from "~/composables/api/list";
import ModalDeleteConfirmation from "~/components/Modal/ModalDeleteConfirmation.vue";
import {useSelfUserStore} from "~/stores/useSelfUser";
import UserQuery from "~/composables/api/query/UserQuery";
import {type User, UserRole} from "~/types/api/item/user";
import {convertUuidToUrlUuid} from "~/utils/resource";

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
  isSideVisible.value = true
}

async function createItem() {
  let item: User = {
    email: '',
  }
  selectedItem.value = item
  isSideVisible.value = true
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
              <div class="text-right">
                <UButton variant="soft" :to="`/super-admin/users/${convertUuidToUrlUuid(row.uuid)}`">Détails</UButton>
              </div>
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
      <div v-if="selectedItem" class="flex flex-col gap-4">
        <UButton v-if="selectedItem.uuid && selectedItem.role !== UserRole.SuperAdmin" color="yellow" block :loading="isLoading" @click="impersonate(selectedItem)">
          Impersonifier
        </UButton>

        <UButton
          v-if="selectedItem.uuid"
          block
          :to="`/super-admin/users/${convertUuidToUrlUuid(selectedItem.uuid)}`"
        >
          Voir en détail
        </UButton>

        <UCard>
          <UserForm :item="selectedItem" @updated="(value) => {selectedItem = value; getItemsPaginated()}" :isList="true" />
        </UCard>
      </div>
    </template>
  </GenericLayoutContentWithSlideover>
</template>
