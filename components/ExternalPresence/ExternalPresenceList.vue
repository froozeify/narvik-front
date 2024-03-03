<script setup lang="ts">
  import type {Member} from "~/types/member";
  import {usePresenceStore} from "~/stores/usePresenceStore";
  import type {ExternalPresence} from "~/types/externalpresence";
  import ExternalPresenceQuery from "~/composables/api/query/ExternalPresenceQuery";
  import {formatDateInput, formatDateReadable} from "~/utils/date";

  const props = defineProps({
    listOnly: {
      type: Boolean,
      required: false,
      default: true
    },
  });

  const toast = useToast();
  const isLoading = ref(true);

  const presenceStore = usePresenceStore()
  const { selectedDate, searchQuery } = storeToRefs(presenceStore)

  const selectedExternalPresence: Ref<ExternalPresence | undefined> = ref(undefined)
  const modalOpen: Ref<boolean> = ref(false);

  const page = ref(1);
  const itemsPerPage = ref(10);
  const sort = ref({
    column: 'date',
    direction: 'desc'
  });

  const members: Ref<Member[]> = ref([])
  const presenceQuery = new ExternalPresenceQuery()

  getPresences();

  watch([searchQuery, selectedDate], (value) => {
    page.value = 1
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
      label: 'Licence',
      class: 'w-24'
    },
    {
      key: 'fullName',
      label: 'Nom',
      class: 'w-1/3'
    }, {
      key: 'activities',
      label: 'Activités'
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
        urlParams.append(`date[before]`, formattedDate);
        urlParams.append(`date[after]`, formattedDate);
      }
    }

    if (searchQuery.value) {
      urlParams.append(`multiple[firstname, lastname, licence]`, searchQuery.value);
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
    if (props.listOnly) return;

    selectedExternalPresence.value = row
    modalOpen.value = true
  }

  function externalPresenceUpdated(externalPresence: ExternalPresence) {
    getPresences()
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

      <template #activities-data="{row}">
        <div v-if="row.activities.length == 0">
          <i>Aucune activités déclarées</i>
        </div>

        <div class="flex flex-1 flex-wrap gap-4">
          <UButton
              v-for="activity in row.activities.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1))"
              color="orange"
              :ui="{ rounded: 'rounded-full' }">
            {{ activity.name }}
          </UButton>
        </div>
      </template>

    </UTable>

    <div class="flex justify-end gap-4 px-3 py-3.5 border-t border-gray-200 dark:border-gray-700">
      <USelect v-model="itemsPerPage" :options="itemsPerPagesValues" @update:model-value="getPresences()" />
      <UPagination v-model="page" @update:model-value="getPresences()" :page-count="parseInt(itemsPerPage.toString())" :total="presenceStore.totalExternal" />
    </div>

    <UModal
        v-model="modalOpen">
      <ExternalPresenceDetails
          :item="selectedExternalPresence"
          @updated="externalPresenceUpdated"
      />
    </UModal>
  </div>
</template>

<style scoped lang="scss">

</style>
