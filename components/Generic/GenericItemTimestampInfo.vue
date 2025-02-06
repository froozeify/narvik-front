<script setup lang="ts">
import type {PropType} from "vue";
import type {TimestampItem} from "~/types/api/timestampItem";

const props = defineProps({
  item: {
    type: Object as PropType<TimestampItem>,
    required: true
  }
});

</script>

<template>
  <UFormGroup label="Créé le">
    <p class="text-sm">{{ formatDateTimeReadable(props.item.createdAt) }}</p>
  </UFormGroup>
  <UFormGroup label="Modifié le">
    <p class="text-sm">{{ formatDateTimeReadable(props.item.updatedAt) }}</p>
  </UFormGroup>
</template>

<style scoped lang="scss">

</style>
