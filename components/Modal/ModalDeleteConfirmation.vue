<script setup lang="ts">
const props = defineProps(
  {
    title: {
      type: String,
      default: 'Êtes-vous certain ?'
    },
    description: {
      type: String,
      default: undefined
    }
  }
)

const emit = defineEmits(['delete'])

</script>

<template>
  <ModalWithActions :title="props.title">

    <slot>{{ props.description }}</slot>

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
