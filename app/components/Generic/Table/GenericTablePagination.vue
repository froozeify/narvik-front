<script setup lang="ts">
import {usePaginationValues} from "~/composables/api/list";
import type {TablePaginateInterface} from "~/types/table";

const props = defineProps({
  totalItems: {
    type: Number,
    default: 0
  },
})

const emit = defineEmits<{
  paginate: [TablePaginateInterface],
}>()

// 2 ways binding
const page = defineModel<number>("page", { default: 1, required: true })
const itemsPerPage = defineModel<number>("itemsPerPage", { default: 30, required: true })

function emitPaginate(pagination: TablePaginateInterface) {
  emit('paginate', pagination)
}

</script>

<template>

  <div class="flex flex-wrap justify-end gap-4 px-3 py-3.5 border-t border-neutral-200 dark:border-neutral-700">
    <USelect class="w-fit" v-model="itemsPerPage" :items="usePaginationValues" @update:model-value="(payload) => emitPaginate({ page: page, itemsPerPage: payload })" />
    <UPagination
      v-model:page="page"
      @update:page="(payload) => emitPaginate({ page: payload, itemsPerPage: itemsPerPage })"
      :items-per-page="parseInt(itemsPerPage.toString())"
      :total="props.totalItems"
      :ui="{
        list: 'flex-wrap'
      }"
    />
  </div>
</template>

<style scoped lang="css">

</style>
