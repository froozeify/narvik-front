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
    <div class="p-0.5 rounded-md text-primary-500 dark:text-primary-400 bg-primary-50 hover:bg-primary-100 dark:bg-primary-950 dark:hover:bg-primary-900 flex justify-center items-center">
      <UIcon name="i-heroicons-chevron-up" @click.stop="emit('changed', props.step)"/>
    </div>
    <div class="p-0.5 rounded-md text-primary-500 dark:text-primary-400 bg-primary-50 hover:bg-primary-100 dark:bg-primary-950 dark:hover:bg-primary-900 flex justify-center items-center">
      <UIcon name="i-heroicons-chevron-down" @click.stop="emit('changed', - props.step)"/>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>
