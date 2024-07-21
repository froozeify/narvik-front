<script setup lang="ts">
import FooterCopyright from "~/components/FooterCopyright.vue";
import {isDesktop, watchBreakpoint} from "~/utils/browser";
const props = defineProps(
  {
    links: {
      type: Array,
      default: []
    }
  }
)

const isDesktopDisplay = isDesktop()
const menuVisible: Ref<boolean> = ref(false)
watchEffect(() => {
  menuVisible.value = isDesktopDisplay.value;
})

</script>

<template>
  <div class="flex flex-col">
    <HeaderNavbar/>
    <main class="min-h-full flex-1">
      <div class="container mx-auto p-4">
        <div class="flex flex-col xl:flex xl:flex-row xl:gap-8">
          <div class="mb-4 xl:basis-60 print:hidden">
            <UButton
              v-if="!isDesktopDisplay"
              class="mb-2"
              icon="i-heroicons-bars-3"
              :label="menuVisible ? 'Masquer le menu' : 'Afficher le menu'"
              @click="menuVisible = !menuVisible"
            />
            <UVerticalNavigation
              v-if="menuVisible"
              :links="links"
              @click="menuVisible = isDesktopDisplay"
              :ui="{
                  wrapper: 'border-s border-gray-200 dark:border-gray-800 space-y-2 sticky top-20',
                  base: 'group block border-s -ms-px xl:leading-6 before:hidden inline-flex',
                  padding: 'p-0 ps-4',
                  rounded: '',
                  font: '',
                  ring: '',
                  active: 'text-primary-500 dark:text-primary-400 border-current font-semibold',
                  inactive: 'border-transparent hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300',
                  label: '',
                  icon: {
                    base: 'flex-shrink-0 w-4 h-4 mr-4',
                    active: 'text-gray-700 dark:text-gray-200',
                    inactive: 'text-gray-400 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-200'
                  }
                }"
            />

          </div>
          <div class="xl:basis-full">
            <slot/>
          </div>
        </div>

      </div>
    </main>
    <footer class="mb-4">
      <FooterCopyright />
    </footer>
    <UNotifications/>
  </div>
</template>

<style scoped lang="scss">

</style>
