<script setup lang="ts">
  import type {Member} from "~/types/member";
  import {usePresenceStore} from "~/stores/usePresenceStore";
  import type {ExternalPresence} from "~/types/externalpresence";
  import {formatDateInput, formatDateReadable} from "~/utils/date";
  import type {MemberPresence} from "~/types/memberpresence";
  import MemberPresenceQuery from "~/composables/api/query/MemberPresenceQuery";

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

  const selectedPresence: Ref<MemberPresence | undefined> = ref(undefined)
  const modalOpen: Ref<boolean> = ref(false);

  const page = ref(1);
  const itemsPerPage = ref(10);
  const sort = ref({
    column: 'date',
    direction: 'desc'
  });

  const members: Ref<Member[]> = ref([])
  const presenceQuery = new MemberPresenceQuery()

  getPresences();

  watch([selectedDate, searchQuery], (value) => {
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
      key: 'member.licence',
      label: 'Licence',
      class: 'w-24'
    }, {
      key: 'member.fullName',
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
      urlParams.append(`multiple[member.firstname, member.lastname, member.licence]`, searchQuery.value);
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
        presenceStore.totalMembers = value.totalItems || 0
      }
    });
  }

  function rowClicked(row: ExternalPresence) {
    selectedPresence.value = row
    modalOpen.value = true
  }

  function presenceUpdated(presence?: MemberPresence) {
    if (!presence) modalOpen.value = false
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
      <UPagination v-model="page" @update:model-value="getPresences()" :page-count="parseInt(itemsPerPage.toString())" :total="presenceStore.totalMembers" />
    </div>

    <UModal
        v-model="modalOpen">
      <PresentMemberDetails
          :view-only="listOnly"
          :item="selectedPresence"
          @updated="presenceUpdated"
      />
    </UModal>
  </div>
</template>

<style scoped lang="scss">

</style>
