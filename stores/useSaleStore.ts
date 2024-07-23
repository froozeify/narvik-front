export const useSaleStore = defineStore('sale', () => {
  const selectedRange: Ref<{ start: Date, end: Date } | null> = ref({start: new Date(), end: new Date()})

  return {
    selectedRange,
  }
})
