<script setup lang="ts">

const props = defineProps(
  {
    title: {
      type: String,
      required: true
    },
  }
)

const emit = defineEmits(['delete'])

</script>

<template>
  <ModalWithActions :title="props.title">

    <UAlert
      class="my-4"
      color="orange"
      variant="soft"
      title="La suppression d'une activité, supprimera aussi toutes les activités des membres liées."
      description="Il conseillé de faire un migration à la place."
    />

    <template #actions>
      <UButton
        @click="emit('delete')"
        color="red"
      >
        Valider la suppression
      </UButton>
    </template>
  </ModalWithActions>
</template>

<style scoped lang="scss">

</style>
