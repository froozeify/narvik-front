<script setup lang="ts">

import type {PropType} from "vue";
import type {Activity} from "~/types/api/item/clubDependent/plugin/presence/activity";
import type {SelectItem} from "#ui/components/Select.vue";

const props = defineProps(
  {
    title: {
      type: String,
      required: true
    },
    activities: {
      type: Object as PropType<Activity[]>,
      required: true
    }
  }
)

const emit = defineEmits(['migrate', 'close'])

const migrationTarget: Ref<string|undefined> = ref(undefined)

const items = computed( () => {
  const items: SelectItem[] = []
  props.activities?.forEach(value => {
    items.push({
      label: value.name,
      value: value.uuid
    })
  })
  return items;
})

</script>

<template>
  <ModalWithActions :title="props.title" @close="(state: boolean) => emit('close', state)">

    <UAlert
      class="my-4"
      color="error"
      variant="soft"
      title="Une fois la migration effectuée, l'activité sera supprimée."
    />

    <UFormField class="mb-4" label="Activité cible">
      <USelect required v-model="migrationTarget" :items="items" />
    </UFormField>

    <template #actions>
      <UButton
        :disabled="!migrationTarget"
        @click="emit('migrate', migrationTarget); emit('close', true)"
      >
        Migrer
      </UButton>
    </template>
  </ModalWithActions>
</template>

<style scoped lang="css">

</style>
