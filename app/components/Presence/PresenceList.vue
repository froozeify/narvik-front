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

  const popoverOpen = ref(false)
</script>

<template>
  <div>
    <UCard class="mb-4">
      <div class="flex flex-wrap items-center gap-4">

        <div>
          <UInput
            v-model="presenceStore.searchQuery"
            placeholder="Rechercher..."  />
        </div>

        <div class="flex-1"></div>

        <UPopover v-model:open="popoverOpen">
          <UButton icon="i-heroicons-calendar-days-20-solid" :label="formatDateRangeReadable(presenceStore.selectedRange) || 'Choisir une date'" />

          <template #content>
            <GenericDateRangePicker v-model="presenceStore.selectedRange" @range-updated="popoverOpen = false" />
          </template>
        </UPopover>

        <UButton
          v-if="presenceStore.selectedRange"
          color="error"
          @click="presenceStore.selectedRange = null"
        >
          Supprimer la date
        </UButton>
      </div>
    </UCard>

    <UAccordion
      variant="soft"
      color="warning"
      :unmount-on-hide="false"
      :ui="{
        item: 'border-none',
        content: 'pt-1.5 pb-3',
        trigger: 'transition mb-1.5 px-2.5 py-1.5 bg-orange-50 dark:bg-orange-950 rounded-md text-orange-500 dark:text-orange-400 border-none  cursor-pointer'
      }"
      :truncate="false"
      :items="[
          {
            'label': `Licenciés autre club / non licenciés (${presenceStore.totalExternal})`,
            'slot': 'external-presences'
          }
        ]"
    >

      <template #external-presences>
        <UCard class="bg-orange-50 dark:bg-orange-950">
          <ExternalPresenceList :list-only="props.listOnly"/>
        </UCard>
      </template>

    </UAccordion>

    <UCard class="mt-4">
      <PresentMemberList :list-only="props.listOnly"/>
    </UCard>
  </div>
</template>

<style scoped lang="css">

</style>
