<script setup lang="ts">
  import {usePresenceStore} from "~/stores/usePresenceStore";
  import {formatDateRangeReadable} from "~/utils/date";

  const props = defineProps({
    listOnly: {
      type: Boolean,
      required: false,
      default: true
    },
  });

  const presenceStore = usePresenceStore()
</script>

<template>
  <div>
    <UCard class="mb-4">
      <div class="flex flex-wrap items-center gap-4">

        <UInput
            v-model="presenceStore.searchQuery"
            placeholder="Rechercher..."  />

        <div class="flex-1"></div>

        <UPopover :popper="{ placement: 'bottom-start' }">
          <UButton icon="i-heroicons-calendar-days-20-solid" :label="formatDateRangeReadable(presenceStore.selectedRange) || 'Choisir une date'" />

          <template #panel="{ close }">
            <GenericDateRangePicker v-model="presenceStore.selectedRange" @close="close" />
          </template>
        </UPopover>

        <UButton
          v-if="presenceStore.selectedRange"
          color="red"
          @click="presenceStore.selectedRange = null"
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
            'label': `Licenciés autre club / non licenciés (${presenceStore.totalExternal})`,
            'slot': 'external-presences'
          }
        ]"
    >

      <template #external-presences>
        <UCard class="bg-orange-50 dark:bg-orange-950">
          <div class="text-xl font-bold mb-4">Présences externe</div>
          <ExternalPresenceList :list-only="props.listOnly"/>
        </UCard>
      </template>

    </UAccordion>

    <UCard class="mt-4">
      <PresentMemberList :list-only="props.listOnly"/>
    </UCard>
  </div>
</template>

<style scoped lang="scss">

</style>
