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
    <div class="p-0.5 rounded-[calc(var(--ui-radius)*1.5)] font-small transition-colors cursor-pointer text-xs gap-1 text-(--ui-primary) bg-(--ui-primary)/10 hover:bg-(--ui-primary)/15 focus:outline-none focus-visible:bg-(--ui-primary)/15 flex justify-center items-center">
      <UIcon name="i-heroicons-chevron-up" class="cursor-pointer" @click.stop="emit('changed', props.step)"/>
    </div>
    <div class="p-0.5 rounded-[calc(var(--ui-radius)*1.5)] font-small transition-colors cursor-pointer text-xs gap-1 text-(--ui-primary) bg-(--ui-primary)/10 hover:bg-(--ui-primary)/15 focus:outline-none focus-visible:bg-(--ui-primary)/15 flex justify-center items-center">
      <UIcon name="i-heroicons-chevron-down" class="cursor-pointer" @click.stop="emit('changed', - props.step)"/>
    </div>  </div>
</template>

<style scoped lang="css">

</style>
