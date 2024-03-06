<script setup lang="ts">
import type {ExternalPresence} from "~/types/externalpresence";
import {useExternalPresenceStore} from "~/stores/useExternalPresence";
import {formatTimeReadable} from "~/utils/date";

const selectedExternalPresence: Ref<ExternalPresence | undefined> = ref(undefined)

const externalPresenceStore = useExternalPresenceStore()
const { isRefreshing } = storeToRefs(externalPresenceStore)

if (externalPresenceStore.list === undefined) {
  getExternalPresences()
}

const columns = [
  {
    key: 'createdAt',
    label: 'Heure',
    class: 'w-20',
    sortable: true
  },
  {
    key: 'licence',
    label: 'Licence',
    class: 'w-24'
  }, {
    key: 'fullName',
    label: 'Nom',
    class: 'w-1/3'
  }, {
    key: 'activities',
    label: 'Activités'
  }
]

async function getExternalPresences() {
  await externalPresenceStore.refresh()
}

function rowClicked(row: ExternalPresence) {
  selectedExternalPresence.value = row;
  externalPresenceStore.modalOpen = true;
}

function externalPresenceUpdated(externalPresence: ExternalPresence) {
  if (!externalPresence) {
    if (selectedExternalPresence.value) {
      externalPresenceStore.deleteItem(selectedExternalPresence.value)
      externalPresenceStore.modalOpen = false
    }
  } else {
    externalPresenceStore.updateItem(externalPresence)
  }
}

</script>

<template>

  <UCard class="bg-orange-50 dark:bg-orange-950">
    <div class="flex px-3 py-3.5 border-b border-gray-200 dark:border-gray-700 items-center">
      <p class="font-bold dark:text-white">Tireurs externes / non licenciés : {{ externalPresenceStore.list.length}}</p>

      <div class="flex-1"></div>

      <div class="inline-flex">
        <UTooltip text="Rafraichir">
          <UButton
              icon="i-heroicons-arrow-path"
              color="gray"
              variant="solid"
              aria-label="Rafraichir"
              :loading="isRefreshing"
              @click="getExternalPresences()"
          />
        </UTooltip>
      </div>
    </div>

    <UTable
        class="w-full"
        :columns="columns"
        :rows="externalPresenceStore.list"
        @select="rowClicked">

      <template #createdAt-data="{row}">
        {{ formatTimeReadable(row.createdAt) }}
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
  </UCard>

  <UModal
      v-model="externalPresenceStore.modalOpen">
    <ExternalPresenceDetails
        :item="selectedExternalPresence"
        @updated="externalPresenceUpdated"
    />
  </UModal>

</template>

<style scoped lang="scss">

</style>
