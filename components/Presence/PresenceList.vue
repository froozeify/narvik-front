<script setup lang="ts">
  import {usePresenceStore} from "~/stores/usePresenceStore";
  import {formatDateReadable} from "~/utils/date";

  const presenceStore = usePresenceStore()

</script>

<template>
  <div>
    <UCard class="mb-4">
      <div class="flex px-3 items-center gap-4">
        <UPopover :popper="{ placement: 'bottom-start' }">
          <UButton icon="i-heroicons-calendar-days-20-solid" :label="formatDateReadable(presenceStore.selectedDate) || 'Choisir une date'" />

          <template #panel="{ close }">
            <DatePicker v-model="presenceStore.selectedDate" @close="close" />
          </template>
        </UPopover>

        <UButton
          v-if="presenceStore.selectedDate"
          color="red"
          @click="presenceStore.selectedDate = null"
        >
          Supprimer la date
        </UButton>
      </div>
    </UCard>

    <UAccordion
      class="mb-0"
      variant="soft"
      color="orange"
      :ui="{
        default: {
          class: 'mb-0'
        }
      }"
      :items="[
          {
            'label': `Tireurs externes / non licenciés (${presenceStore.totalExternal})`,
            'slot': 'external-presences'
          }
        ]"
    >

      <template #external-presences>
        <UCard class="bg-orange-50 dark:bg-orange-950">
          <div class="text-xl font-bold mb-4">Présences externe</div>
          <ExternalPresenceList />
        </UCard>
      </template>

    </UAccordion>

    <UCard class="mt-4">
      <div class="text-xl font-bold mb-4">Présences membres ({{presenceStore.totalMembers}})</div>
      <PresentMemberList />
    </UCard>
  </div>
</template>

<style scoped lang="scss">

</style>
