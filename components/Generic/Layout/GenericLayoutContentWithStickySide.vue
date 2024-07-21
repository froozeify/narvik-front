<script setup lang="ts">

const props = defineProps(
  {
    displaySide: {
      type: Array,
      default: []
    }
  }
)

</script>

<template>
  <div class="flex flex-col-reverse lg:flex-row gap-4">
    <div class="flex-1 shrink-0">
      <slot name="main"></slot>
    </div>

    <div v-show="props.displaySide" class="lg:w-1/3 w-full h-fit lg:sticky lg:top-20 max-h-[calc(100vh-6rem)] flex flex-col gap-4 overflow-y-auto">
      <slot name="side"></slot>
    </div>

  </div>
</template>

<style scoped lang="scss">

</style>
