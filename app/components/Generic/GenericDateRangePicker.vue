<script setup lang="ts">
  // import { DatePicker as VCalendarDatePicker } from 'v-calendar'
  // import type { DatePickerRangeObject } from 'v-calendar/dist/types/src/use/datePicker'
  // import 'v-calendar/dist/style.css'
  import dayjs from "dayjs";

  const props = defineProps({
    modelValue: {
      type: [Date, Object] as PropType<object | null>,
      default: null
    }
  })

  const emit = defineEmits(['update:model-value', 'close'])

  const columns = computed(() => {
    return isMobile().value ? 1 : 2
  })

  const date = computed({
    get: () => props.modelValue,
    set: (value) => {
      emit('update:model-value', value)
      emit('close')
    }
  })

  const attrs = {
    transparent: true,
    borderless: true,
    color: 'primary',
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
    Migrate to other nuxt calendar
<!--    <VCalendarDatePicker v-model.range="date" :columns="columns" v-bind="{ ...attrs, ...$attrs }" />-->
  </div>

</template>

<style>
  :root {
    --vc-gray-50: rgb(var(--color-gray-50));
    --vc-gray-100: rgb(var(--color-gray-100));
    --vc-gray-200: rgb(var(--color-gray-200));
    --vc-gray-300: rgb(var(--color-gray-300));
    --vc-gray-400: rgb(var(--color-gray-400));
    --vc-gray-500: rgb(var(--color-gray-500));
    --vc-gray-600: rgb(var(--color-gray-600));
    --vc-gray-700: rgb(var(--color-gray-700));
    --vc-gray-800: rgb(var(--color-gray-800));
    --vc-gray-900: rgb(var(--color-gray-900));
  }

  .vc-primary {
    --vc-accent-50: rgb(var(--color-primary-50));
    --vc-accent-100: rgb(var(--color-primary-100));
    --vc-accent-200: rgb(var(--color-primary-200));
    --vc-accent-300: rgb(var(--color-primary-300));
    --vc-accent-400: rgb(var(--color-primary-400));
    --vc-accent-500: rgb(var(--color-primary-500));
    --vc-accent-600: rgb(var(--color-primary-600));
    --vc-accent-700: rgb(var(--color-primary-700));
    --vc-accent-800: rgb(var(--color-primary-800));
    --vc-accent-900: rgb(var(--color-primary-900));
  }
</style>
