<script setup lang="ts">
import type {PropType} from "vue";

const props = defineProps({
  title: {
    type: String,
    required: false
  }
});

</script>

<template>
  <UCard>
    <div v-if="props.title" class="text-xl font-bold mb-4">{{ props.title }}</div>
    <slot />
  </UCard>
</template>

<style scoped lang="scss">

</style>
