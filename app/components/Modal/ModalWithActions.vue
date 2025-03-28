<script setup lang="ts">
const emit = defineEmits(['cancel'])

const props = defineProps(
  {
    title: {
      type: String,
      default: undefined
    },
  }
)
</script>

<template>
  <UModal>
    <UCard>
      <div class="flex flex-col gap-4">
        <div class="text-xl font-bold text-center">{{ props.title }}</div>
        <slot></slot>

        <div class="flex gap-2 justify-between sm:justify-end flex-wrap">
          <slot name="cancel">
            <UButton color="gray" variant="ghost" @click="useModal().close(); emit('cancel')">
              Annuler
            </UButton>
          </slot>

          <slot name="actions"></slot>
        </div>
      </div>
    </UCard>
  </UModal>
</template>

<style scoped lang="scss">

</style>
