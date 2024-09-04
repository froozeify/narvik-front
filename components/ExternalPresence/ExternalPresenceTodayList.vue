<script setup lang="ts">
import type {ExternalPresence} from "~/types/api/item/externalPresence";
import {useExternalPresenceStore} from "~/stores/useExternalPresence";

const selectedExternalPresence: Ref<ExternalPresence | undefined> = ref(undefined)

const externalPresenceStore = useExternalPresenceStore()
const { isRefreshing } = storeToRefs(externalPresenceStore)

if (externalPresenceStore.list === undefined) {
  getExternalPresences()
}

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

  <UCard v-if="externalPresenceStore.list" class="bg-orange-50 dark:bg-orange-950">
    <div class="flex px-3 py-3.5 border-b border-gray-200 dark:border-gray-700 items-center">
      <p class="font-bold dark:text-white">Licenciés autre club / non licenciés : {{ externalPresenceStore.list.length}}</p>

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

    <PresenceTable
      :is-external-presences="true"
      :presences="externalPresenceStore.list"
      :total-presences="externalPresenceStore.list.length"
      :display-no-data-register="false"
      :display-full-date="false"
      :has-pagination="false"
      :is-loading="isRefreshing"
      accent-color="orange"
      @rowClicked="rowClicked"
    />
  </UCard>

  <UModal
      v-model="externalPresenceStore.modalOpen">
    <ExternalPresenceDetails
        v-if="selectedExternalPresence"
        :item="selectedExternalPresence"
        @updated="externalPresenceUpdated"
        @close="externalPresenceStore.modalOpen = false; selectedExternalPresence = undefined"
    />
  </UModal>

</template>

<style scoped lang="scss">

</style>
