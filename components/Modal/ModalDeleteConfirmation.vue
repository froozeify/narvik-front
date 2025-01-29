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
    alertTitle: {
      type: String,
      default: undefined
    },
    alertDescription: {
      type: String,
      default: undefined
    },
    alertColor: {
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
      <div>
        <UAlert v-if="alertTitle || alertDescription || alertColor"
                class="mb-4"
                variant="subtle"
                :color="alertColor"
                :title="alertTitle"
                :description="alertDescription"
        />
        <div>
          {{ props.description }}
        </div>
      </div>
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
