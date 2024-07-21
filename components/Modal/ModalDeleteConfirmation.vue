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
  <UModal>
    <UCard>
      <div class="flex flex-col gap-4">
        <div class="text-xl font-bold">{{ props.title }}</div>
        {{ props.description }}

        <div class="flex gap-2 justify-end">
          <UButton color="gray" variant="ghost" @click="useModal().close()">
            Annuler
          </UButton>

          <UButton
            @click="emit('delete')"
            color="red"
          >
            Supprimer
          </UButton>
        </div>
      </div>
    </UCard>
  </UModal>
</template>

<style scoped lang="scss">

</style>
