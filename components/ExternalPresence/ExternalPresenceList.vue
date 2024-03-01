<script setup lang="ts">
  import type {Member} from "~/types/member";
  import MemberQuery from "~/composables/api/query/MemberQuery";
  import {usePresenceStore} from "~/stores/usePresenceStore";
  import type {ExternalPresence} from "~/types/externalpresence";
  import ExternalPresenceQuery from "~/composables/api/query/ExternalPresenceQuery";
  import {formatDateInput, formatDateReadable} from "~/utils/date";

  const toast = useToast();
  const isLoading = ref(true);

  const presenceStore = usePresenceStore()
  const { selectedDate } = storeToRefs(presenceStore)

  const page = ref(1);
  const itemsPerPage = ref(10);
  const sort = ref({
    column: 'date',
    direction: 'asc'
  });

  const members: Ref<Member[]> = ref([])
  const presences: Ref<ExternalPresence[]> = ref([])

  const memberQuery = new MemberQuery()
  const presenceQuery = new ExternalPresenceQuery()

  getPresences();

  watch(selectedDate, (value) => {
    getPresences()
  })


  const itemsPerPagesValues = [
      5,
      10,
      30,
      100
  ]

  const columns = [
    {
      key: 'date',
      label: 'Date',
      sortable: true
    },
    {
      key: 'licence',
      label: 'Licence'
    },
    {
      key: 'lastname',
      label: 'Nom'
    },
    {
      key: 'firstname',
      label: 'Prénom'
    }
  ]

  function getPresences() {
    isLoading.value = true;

    const urlParams = new URLSearchParams({
      page: page.value.toString(),
      itemsPerPage: itemsPerPage.value.toString(),
    });


    urlParams.append(`order[${sort.value.column}]`, sort.value.direction);

    if (selectedDate.value) {
      const formattedDate = formatDateInput(selectedDate.value.toString())
      if (formattedDate) {
        urlParams.append(`date[after]`, formattedDate);
      }
    }

    presenceQuery.getAll(urlParams).then(value => {
      isLoading.value = false;

      if (value.error) {
        toast.add({
          color: "red",
          title: "Une erreur s'est produite",
          description: value.error.message || value.error.toString()
        })
        return;
      }

      if (value.items) {
        members.value = value.items
        presenceStore.totalExternal = value.totalItems || 0
      }
    });
  }

  function rowClicked(row: ExternalPresence) {
    navigateTo(`/admin/presences/external-${row.id}`)
  }

</script>

<template>
  <div>

    <UTable
        :loading="isLoading"
        class="w-full"
        v-model:sort="sort"
        sort-mode="manual"
        @update:sort="getPresences()"
        :columns="columns"
        :rows="members"
        @select="rowClicked">
      <template #empty-state>
        <div class="flex flex-col items-center justify-center py-6 gap-3">
          <span class="italic text-sm">Aucune présences trouvées.</span>
        </div>
      </template>

      <template #date-data="{row}">
        {{ formatDateReadable(row.date) }}
      </template>

      <template #licence-data="{row}">
        <div v-if="!row.licence">
          <i>Non communiquée</i>
        </div>
        <div v-else>
          {{ row.licence }}
        </div>
      </template>

    </UTable>

    <div class="flex justify-end gap-4 px-3 py-3.5 border-t border-gray-200 dark:border-gray-700">
      <USelect v-model="itemsPerPage" :options="itemsPerPagesValues" @update:model-value="getPresences()" />
      <UPagination v-model="page" @update:model-value="getPresences()" :page-count="parseInt(itemsPerPage.toString())" :total="presenceStore.totalExternal" />
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>
