<script setup lang="ts">
const isOpen = defineModel<boolean>({default: false})
</script>

<template>
  <div>
    <slot name="main"></slot>
    <USlideover v-model="isOpen">
      <div class="flex flex-col h-full max-h-full">
        <UButton
          label="Fermer"
          block
          variant="soft"
          size="sm"
          class="sm:hidden rounded-none"
          @click="isOpen = false"
        />
        <div class="p-4 flex-1 overflow-y-auto">
          <slot name="side"></slot>
        </div>
      </div>
    </USlideover>
  </div>
</template>

<style scoped lang="scss">

</style>
