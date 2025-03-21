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
const onlyCurrentSeason = ref(false);
const onlySeasonNotRenewed = ref(false);
const onlyPreviousSeason = ref(false);
const onlyWithLicence = ref(true);


const members: Ref<Member[]> = ref([]);
const memberQuery = new MemberQuery();
const createMemberModal = ref(false)

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
  },
  {
    key: 'status',
    label: 'Statut'
  }
]

function getMembers() {
  isLoading.value = true;

  const urlParams = new URLSearchParams({
    page: page.value.toString(),
    itemsPerPage: itemsPerPage.value.toString(),
  });

  urlParams.append(`order[${sort.value.column}]`, sort.value.direction);
  urlParams.append(`order[firstname]`, 'asc');

  if (query.value.trim().length > 0) {
    urlParams.append('multiple[licence, firstname, lastname]', query.value.trim())
  }

  if (onlyCurrentSeason.value) {
    urlParams.append('currentSeason[memberSeasons.season]', 'true');
  }

  if (onlyPreviousSeason.value) {
    urlParams.append('previousSeason[memberSeasons.season]', 'true');
  }

  if (onlySeasonNotRenewed.value) {
    urlParams.append('seasonNotRenewed[memberSeasons.season]', 'true');
  }

  if (onlyWithLicence.value) {
    urlParams.append('exists[licence]', 'true');
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

function displayMemberPage(member: Member) {
  navigateTo(`/admin/members/${convertUuidToUrlUuid(member.uuid)}`)
}

</script>

<template>
  <div class="flex flex-col gap-4">
    <UCard>
      <div class="flex gap-2 flex-col flex-wrap sm:flex-row">

        <div class="flex flex-col justify-center">
          <UInput
            v-model="query"
            @update:model-value="queryUpdated()"
            placeholder="Rechercher..."  />
        </div>
        <div class="flex-1"></div>

        <div class="grid grid-cols-2 gap-2 gap-x-4">
          <UCheckbox label="Saison actuelle" v-model="onlyCurrentSeason" @change="onlySeasonNotRenewed = false; onlyPreviousSeason = false; page = 1; getMembers()" />
          <UCheckbox label="Non renouvelée" v-model="onlySeasonNotRenewed" @change="onlyCurrentSeason = false; page = 1; getMembers()" />
          <UCheckbox label="Saison précédente" v-model="onlyPreviousSeason" @change="onlyCurrentSeason = false; page = 1; getMembers()" />
          <UCheckbox label="Licence" v-model="onlyWithLicence" @change="page = 1; getMembers()" />
        </div>
      </div>
    </UCard>

    <UCard>
      <div class="flex gap-2 flex-row flex-wrap">
        <div class="text-xl font-bold">Membres ({{ totalMembers }})</div>
        <div class="flex-1"></div>
        <div class="flex justify-end">
          <UButton @click="createMemberModal = true" icon="i-heroicons-plus"></UButton>
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
        @select="displayMemberPage">
        <template #empty-state>
          <div class="flex flex-col items-center justify-center py-6 gap-3">
            <span class="italic text-sm">Aucun membres trouvés.</span>
          </div>
        </template>

        <template #status-data="{ row }">
          <i v-if="!row.currentSeason">Saison non renouvelée</i>
        </template>

      </UTable>

      <div class="flex justify-end gap-4 px-3 py-3.5 border-t border-gray-200 dark:border-gray-700">
        <USelect v-model="itemsPerPage" :options="usePaginationValues" @update:model-value="getMembers()" />
        <UPagination v-model="page" @update:model-value="getMembers()" :page-count="parseInt(itemsPerPage.toString())" :total="totalMembers" />
      </div>
    </UCard>
  </div>

  <UModal
    v-model="createMemberModal">
    <UCard>
      <MemberForm
        @updated="(value) => {createMemberModal = false; displayMemberPage(value) }"
      />
    </UCard>
  </UModal>
</template>

<style scoped lang="scss">

</style>
