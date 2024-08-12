<script setup lang="ts">
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

        <div class="flex gap-2 justify-between sm:justify-end">
          <UButton color="gray" variant="ghost" @click="useModal().close()">
            Annuler
          </UButton>

          <slot name="actions"></slot>
        </div>
      </div>
    </UCard>
  </UModal>
</template>

<style scoped lang="scss">

</style>
