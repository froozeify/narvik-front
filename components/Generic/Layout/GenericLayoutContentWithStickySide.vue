<script setup lang="ts">

import {isDesktop, isTablet} from "~/utils/browser";

const props = defineProps(
  {
    displaySide: {
      type: Boolean,
      default: true
    },
    hasSideContent: {
      type: Boolean,
      default: true
    },
    mobileSideTitle: {
      type: String,
      default: 'Afficher'
    }
  }
)

const isDesktopDisplay = isDesktop()
const isTabletDisplay = isTablet()

const asideMobileClasses = ref(['overflow-y-auto', 'flex flex-col gap-4 fixed bottom-0 left-4 right-4 rounded-t-lg backdrop-blur-2xl z-10'])
const asideDesktopClasses = 'lg:w-1/3 lg:sticky lg:top-20 lg:h-fit lg:max-h-[calc(100vh-6rem)]'
const asideButtonMargin = ref('')

const sideClasses = computed(() => {
  return asideMobileClasses.value.join(' ') + ' ' + asideDesktopClasses
})

const sideMobileVisible = ref(false)
watchEffect(() => {
  if (isDesktopDisplay.value || isTabletDisplay.value) {
    sideMobileVisible.value = true
  }

  const openClasses = 'max-h-[45vh]'
  const closedClasses = ''

  // Side menu open
  if (sideMobileVisible.value) {
    asideButtonMargin.value = '-mb-4'
    asideMobileClasses.value.push(openClasses)
    asideMobileClasses.value = asideMobileClasses.value.filter(e => e !== closedClasses)
  } else {
    asideButtonMargin.value = ''
    asideMobileClasses.value.push(closedClasses)
    asideMobileClasses.value = asideMobileClasses.value.filter(e => e !== openClasses)
  }
})

</script>

<template>
  <div class="flex flex-col-reverse lg:flex-row gap-4">
    <div class="flex-1 shrink-0">
      <slot name="main"></slot>
    </div>

    <div v-if="props.displaySide" :class="sideClasses">
      <div v-if="hasSideContent" :class="`text-center lg:hidden ${asideButtonMargin}`">
        <UButton
          block
          :ui="{ rounded: 'rounded-t-lg rounded-b-none' }"
          :leading-icon="'i-heroicons-chevron-double-' + (sideMobileVisible ? 'down' : 'up')"
          :trailing-icon="'i-heroicons-chevron-double-' + (sideMobileVisible ? 'down' : 'up')"
          variant="soft"
          @click="sideMobileVisible = !sideMobileVisible"
        >
          <span class="flex-1">{{ props.mobileSideTitle }}</span>
        </UButton>
      </div>
      <div v-if="sideMobileVisible" class="overflow-y-auto flex flex-col gap-4">
        <slot name="side"></slot>
      </div>
    </div>

  </div>
</template>

<style scoped lang="scss">

</style>
