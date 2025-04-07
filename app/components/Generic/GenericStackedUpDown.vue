<script setup lang="ts">

const props = defineProps({
  step: {
    type: Number,
    default: 1
  }
})

const emit = defineEmits([
  'changed'
])
</script>

<template>
  <div class="text-xs flex flex-col gap-0.5">
    <UButton variant="soft" size="xs" icon="i-heroicons-chevron-up" @click.stop="emit('changed', props.step)" />
    <UButton variant="soft" size="xs" icon="i-heroicons-chevron-down" @click.stop="emit('changed', - props.step)" />
  </div>
</template>

<style scoped lang="css">

</style>
