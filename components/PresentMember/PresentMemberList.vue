<script setup lang="ts">
  import type {Member} from "~/types/api/item/member";
  import {usePresenceStore} from "~/stores/usePresenceStore";
  import type {ExternalPresence} from "~/types/api/item/externalPresence";
  import {formatDateInput, formatDateReadable} from "~/utils/date";
  import type {MemberPresence} from "~/types/api/item/memberPresence";
  import MemberPresenceQuery from "~/composables/api/query/MemberPresenceQuery";
  import {usePaginationValues} from "~/composables/api/list";
  import {useSelfMemberStore} from "~/stores/useSelfMember";

  const props = defineProps({
    listOnly: {
      type: Boolean,
      required: false,
      default: true
    },
  });

  const toast = useToast();
  const isLoading = ref(true);

  const selfStore = useSelfMemberStore()
  const presenceStore = usePresenceStore()
  const { selectedRange, searchQuery } = storeToRefs(presenceStore)

  const isAdmin = selfStore.isAdmin()

  const selectedPresence: Ref<MemberPresence | undefined> = ref(undefined)
  const modalOpen: Ref<boolean> = ref(false);

  const isDownloadingCsv = ref(false)

  const page = ref(1);
  const itemsPerPage = ref(10);
  const sort = ref({
    column: 'date',
    direction: 'desc'
  });

  const members: Ref<Member[]> = ref([])
  const presenceQuery = new MemberPresenceQuery()

  getPresences();

  watch([selectedRange, searchQuery], (value) => {
    page.value = 1
    getPresences()
  })

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
    urlParams.append(`order[createdAt]`, sort.value.direction);

    if (selectedRange.value) {
      const formattedStartDate = formatDateInput(selectedRange.value.start.toString())
      const formattedEndDate = formatDateInput(selectedRange.value.end.toString())
      if (formattedStartDate) {
        urlParams.append(`date[after]`, formattedStartDate);

        if (formattedEndDate) {
          urlParams.append(`date[before]`, formattedEndDate);
        } else {
          urlParams.append(`date[before]`, formattedStartDate);
        }
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

  async function downloadCsv() {
    isDownloadingCsv.value = true

    const urlParams = new URLSearchParams({
      pagination: 'false',
    });

    urlParams.append(`order[${sort.value.column}]`, sort.value.direction);

    if (selectedRange.value) {
      const formattedStartDate = formatDateInput(selectedRange.value.start.toString())
      const formattedEndDate = formatDateInput(selectedRange.value.end.toString())
      if (formattedStartDate) {
        urlParams.append(`date[after]`, formattedStartDate);

        if (formattedEndDate) {
          urlParams.append(`date[before]`, formattedEndDate);
        } else {
          urlParams.append(`date[before]`, formattedStartDate);
        }
      }
    } else {
      isDownloadingCsv.value = false
      toast.add({
        color: "red",
        title: "Date non définie.",
        description: "Veuillez sélectionner une date afin de pouvoir télécharger le csv."
      })
      return;
    }

    if (searchQuery.value) {
      urlParams.append(`multiple[member.firstname, member.lastname, member.licence]`, searchQuery.value);
    }

    // We make the search
    const { data } = await presenceQuery.getAllCsv(urlParams)
    isDownloadingCsv.value = false
    // We download in the browser
    const filename = `presences.csv`
    const blob = new Blob([data], {type: 'text/csv'})
    if(window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveBlob(blob, filename)
    } else {
      const elem = window.document.createElement('a')
      elem.href = window.URL.createObjectURL(blob)
      elem.download = filename
      document.body.appendChild(elem)
      elem.click()
      document.body.removeChild(elem)
    }
  }

</script>

<template>
  <div>

    <div class="flex flex-wrap items-center gap-4">
      <div class="text-xl font-bold mb-4">Présences membres ({{presenceStore.totalMembers}})</div>

      <div class="flex-1"></div>

      <template v-if="isAdmin">
        <UButton @click="downloadCsv()" icon="i-heroicons-arrow-down-tray" color="green" :loading="isDownloadingCsv" :disabled="!selectedRange">
          CSV
        </UButton>
      </template>
    </div>

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
        {{ formatDateReadable(row.date) }} à {{ formatTimeReadable(row.createdAt) }}
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
      <USelect v-model="itemsPerPage" :options="usePaginationValues" @update:model-value="getPresences()" />
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
