<script setup lang="ts">
import type {ExternalPresence} from "~/types/externalpresence";
import {useExternalPresenceStore} from "~/stores/useExternalPresence";

const externalPresenceModalOpen = ref(false);
const selectedExternalPresence: Ref<ExternalPresence | undefined> = ref(undefined)

const externalPresenceStore = useExternalPresenceStore()
if (externalPresenceStore.list === undefined) {
  externalPresenceStore.refresh()
}

const columns = [{
  key: 'licence',
  label: 'Licence'
}, {
  key: 'fullName',
  label: 'Nom'
}, {
  key: 'activities',
  label: 'Activités'
}]

function rowClicked(row: ExternalPresence) {
  selectedExternalPresence.value = row;
  externalPresenceModalOpen.value = true;
}

function externalPresenceUpdated(externalPresence: ExternalPresence) {
  externalPresenceStore.updateItem(externalPresence)
}

</script>

<template>

  <UCard class="bg-orange-50 dark:bg-orange-950">
    <UTable
        class="w-full"
        :columns="columns"
        :rows="externalPresenceStore.list"
        @select="rowClicked">

      <template #licence-data="{row}">
        <div v-if="!row.licence">
          <i>Non communiqué</i>
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
  </UCard>

  <UModal
      v-model="externalPresenceModalOpen">
    <ExternalPresenceDetails
        :item="selectedExternalPresence"
        @updated="externalPresenceUpdated"
    />
  </UModal>

</template>

<style scoped lang="scss">

</style>
