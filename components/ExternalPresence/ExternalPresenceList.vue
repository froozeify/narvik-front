<script setup lang="ts">
  import {usePresenceStore} from "~/stores/usePresenceStore";
  import type {ExternalPresence} from "~/types/api/item/externalPresence";
  import ExternalPresenceQuery from "~/composables/api/query/ExternalPresenceQuery";
  import {formatDateInput} from "~/utils/date";
  import type {TablePaginateInterface, TableSortInterface} from "~/components/Presence/PresenceTable.vue";

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
  const { selectedRange, searchQuery } = storeToRefs(presenceStore)

  const selectedExternalPresence: Ref<ExternalPresence | undefined> = ref(undefined)
  const modalOpen: Ref<boolean> = ref(false);

  const page = ref(1);
  const itemsPerPage = ref(10);
  const sort = ref({
    column: 'date',
    direction: 'desc'
  });

  const presences: Ref<ExternalPresence[]> = ref([])
  const presenceQuery = new ExternalPresenceQuery()

  getPresences();

  watch([searchQuery, selectedRange], (value) => {
    page.value = 1
    getPresences()
  })

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
        presences.value = value.items
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

    <PresenceTable
      :is-external-presences="true"
      :presences="presences"
      :total-presences="presenceStore.totalExternal"
      :can-sort="true"
      :display-no-data-register="false"
      :is-loading="isLoading"
      accent-color="orange"
      @rowClicked="rowClicked"
      @sort="(object: TableSortInterface) => { sort = object; getPresences() }"
      @paginate="(object: TablePaginateInterface) => { page = object.page; itemsPerPage = object.itemsPerPage; sort = object.sort; getPresences() }"
    />

    <UModal
        v-model="modalOpen">
      <ExternalPresenceDetails
          v-if="selectedExternalPresence"
          :item="selectedExternalPresence"
          @updated="externalPresenceUpdated"
          @close="modalOpen = false; selectedExternalPresence = undefined"
      />
    </UModal>
  </div>
</template>

<style scoped lang="scss">

</style>
