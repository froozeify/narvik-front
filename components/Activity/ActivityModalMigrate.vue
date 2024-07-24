<script setup lang="ts">

import type {PropType} from "vue";
import type {Activity} from "~/types/api/item/activity";

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

const emit = defineEmits(['migrate'])

const migrationTarget: Ref<string|undefined> = ref(undefined)

</script>

<template>
  <ModalWithActions :title="props.title">

    <UAlert
      class="my-4"
      color="yellow"
      variant="soft"
      title="Une fois la migration effectuée, l'activité sera supprimée."
    />

    <UFormGroup class="mb-4" label="Activité cible">
      <USelect required v-model="migrationTarget" :options="props.activities" option-attribute="name" value-attribute="id" />
    </UFormGroup>

    <template #actions>
      <UButton
        :disabled="!migrationTarget"
        @click="emit('migrate', migrationTarget)"
        color="orange"
      >
        Migrer
      </UButton>
    </template>
  </ModalWithActions>
</template>

<style scoped lang="scss">

</style>
