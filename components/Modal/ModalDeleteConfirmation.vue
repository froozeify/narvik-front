<script setup lang="ts">
import type {AlertColor} from "#ui/types";
import type {PropType} from "vue";
import type {ExternalPresence} from "~/types/api/item/clubDependent/plugin/presence/externalPresence";

const props = defineProps(
  {
    title: {
      type: String,
      default: 'Êtes-vous certain ?'
    },
    description: {
      type: String,
      default: undefined
    },
    descriptionColor: {
      type: String as PropType<AlertColor>,
      default: undefined
    }
  }
)

const emit = defineEmits(['delete'])

</script>

<template>
  <ModalWithActions :title="props.title">

    <slot>
      <template v-if="!descriptionColor">
        {{ props.description }}
      </template>
      <UAlert v-else
        class="mb-4"
        variant="subtle"
        :color="descriptionColor"
        :description="description"
      />
    </slot>

    <template #actions>
      <UButton
        @click="emit('delete')"
        color="red"
      >
        Supprimer
      </UButton>
    </template>
  </ModalWithActions>
</template>

<style scoped lang="scss">

</style>
