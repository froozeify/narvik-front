<script setup lang="ts">

import type {Member} from "~/types/api/item/clubDependent/member";
import MemberQuery from "~/composables/api/query/clubDependent/MemberQuery";
import {usePaginationValues} from "~/composables/api/list";
import {convertUuidToUrlUuid} from "~/utils/resource";

const toast = useToast();
const isLoading = ref(true);

const page = ref(1);
const itemsPerPage = ref(30);
const sort = ref({
  column: 'lastname',
  direction: 'asc'
});
const totalMembers: Ref<number> = ref(0);

const query = ref('');
const onlyCurrentSeason = ref(true);


const members: Ref<Member[]> = ref([]);
const memberQuery = new MemberQuery();

getMembers();

const columns = [
  {
    key: 'licence',
    label: 'Licence'
  },
  {
    key: 'lastname',
    label: 'Nom',
    sortable: true
  },
  {
    key: 'firstname',
    label: 'Prénom'
  }
]

function getMembers() {
  isLoading.value = true;

  const urlParams = new URLSearchParams({
    page: page.value.toString(),
    itemsPerPage: itemsPerPage.value.toString(),
    'exists[licence]': 'true',
  });

  urlParams.append(`order[${sort.value.column}]`, sort.value.direction);
  urlParams.append(`order[firstname]`, 'asc');

  if (query.value.trim().length > 0) {
    urlParams.append('multiple[licence, firstname, lastname]', query.value.trim())
  }

  if (onlyCurrentSeason.value) {
    urlParams.append('currentSeason[memberSeasons.season]', 'true');
  }

  memberQuery.getAll(urlParams).then(value => {
    isLoading.value = false;

    if (value.error) {
      toast.add({
        color: "red",
        title: "Une erreur s'est produite",
        description: value.error.message || value.error.toString()
      })
    }

    if (value.items) {
      members.value = value.items
      if (value.totalItems) {
        totalMembers.value = value.totalItems
      }
    }
  });
}

let inputTimer: NodeJS.Timeout;
function queryUpdated() {
  clearTimeout(inputTimer);
  inputTimer = setTimeout(async () => {
    page.value = 1;
    getMembers()
  }, 800);
}

function rowClicked(row: Member) {
  navigateTo(`/admin/members/${convertUuidToUrlUuid(row.uuid)}`)
}


</script>

<template>
  <div>
    <div class="flex px-3 py-3.5 border-b border-gray-200 dark:border-gray-700 items-center">
      <UInput
          v-model="query"
          @update:model-value="queryUpdated()"
          placeholder="Rechercher..."  />
      <div class="flex-1"></div>

      <div class="inline-flex">
        <span class="mr-4 text-sm">Saison actuelle</span>
        <UToggle v-model="onlyCurrentSeason" @update:model-value="page = 1; getMembers()" />
      </div>
    </div>

    <UTable
        :loading="isLoading"
        class="w-full"
        v-model:sort="sort"
        sort-mode="manual"
        @update:sort="getMembers()"
        :columns="columns"
        :rows="members"
        @select="rowClicked">
      <template #empty-state>
        <div class="flex flex-col items-center justify-center py-6 gap-3">
          <span class="italic text-sm">Aucun membres trouvés.</span>
        </div>
      </template>

    </UTable>

    <div class="flex justify-end gap-4 px-3 py-3.5 border-t border-gray-200 dark:border-gray-700">
      <USelect v-model="itemsPerPage" :options="usePaginationValues" @update:model-value="getMembers()" />
      <UPagination v-model="page" @update:model-value="getMembers()" :page-count="parseInt(itemsPerPage.toString())" :total="totalMembers" />
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>
