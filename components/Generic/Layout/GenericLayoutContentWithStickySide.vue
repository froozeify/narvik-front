<script setup lang="ts">
console.log('hello')
</script>

<template>
  <div class="flex flex-col-reverse lg:flex-row gap-4">
    <div class="lg:w-2/3 shrink-0">
      <slot name="main"></slot>
    </div>

    <div class="w-full h-fit lg:sticky lg:top-20 max-h-[calc(100vh-6rem)] flex flex-col gap-4">
      <slot name="side"></slot>
    </div>

  </div>
</template>

<style scoped lang="scss">

</style>
