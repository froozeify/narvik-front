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
  <UFormField label="Créé le">
    <p class="text-sm">{{ formatDateTimeReadable(props.item.createdAt) }}</p>
  </UFormField>
  <UFormField label="Modifié le">
    <p class="text-sm">{{ formatDateTimeReadable(props.item.updatedAt) }}</p>
  </UFormField>
</template>

<style scoped lang="scss">

</style>
