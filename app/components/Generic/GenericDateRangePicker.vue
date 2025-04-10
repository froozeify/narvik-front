<script setup lang="ts">
import { DatePicker as VCalendarDatePicker } from 'v-calendar'
import 'v-calendar/style.css'
import dayjs from "dayjs";
import type {DateRange} from "~/types/date";

const date = defineModel<DateRange|undefined>({default: undefined})

const emit = defineEmits<{ rangeUpdated: [DateRange | undefined] }>()

const columns = computed(() => {
  return isMobile().value ? 1 : 2
})

const attrs = {
  transparent: true,
  borderless: true,
  color: 'nk',
  'is-dark': { selector: 'html', darkClass: 'dark' },
  'first-day-of-week': 2,
  attributes: [
    {
      key: 'today',
      dot: {
        style: {
          marginBottom: '2px'
        }
      },
      dates: new Date(),
    }
  ]
}

const ranges = [
  { label: '7 derniers jours', duration: { type: 'day', value: 7 } },
  { label: '14 derniers jours', duration: { type: 'day', value: 14 } },
  { label: '30 derniers jours', duration: { type: 'day', value: 30 } },
  { label: '3 derniers mois', duration: { type: 'month', value: 3 } },
  { label: '6 derniers mois', duration: { type: 'month', value: 6 } },
  { label: 'Dernière année', duration: { type: 'year', value: 1 } }
]

function isRangeSelected (duration: { type: string, value: number }) {
  if (!date.value) return false
  return dayjs(date.value.start).isSame(dayjs().subtract(duration.value, duration.type), 'day') && dayjs().isSame(date.value.end, 'day')
}

function selectRange (duration: { type: string, value: number }) {
  date.value = { start: dayjs().subtract(duration.value, duration.type).toDate(), end: new Date() }
}
</script>

<template>
  <div class="flex items-center sm:divide-x divide-gray-200 dark:divide-gray-800">
    <div class="hidden sm:flex flex-col py-4">
      <UButton
          v-for="(range, index) in ranges"
          :key="index"
          :label="range.label"
          color="neutral"
          variant="ghost"
          class="rounded-none px-6"
          :class="[isRangeSelected(range.duration) ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50']"
          truncate
          @click="selectRange(range.duration)"
      />
    </div>
    <VCalendarDatePicker v-model.range="date" @update:model-value="emit('rangeUpdated', date)" :columns="columns" v-bind="{ ...attrs, ...$attrs }" />
  </div>

</template>

<style>

</style>
