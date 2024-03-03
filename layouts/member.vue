<script lang="ts" setup>
import {useSetSiteFavicon} from "~/composables/image";
import FooterCopyright from "~/components/FooterCopyright.vue";


useHead({
  titleTemplate: (title) => {
    return title ? `${title} - Narvik` : 'Narvik'
  }
})

useSetSiteFavicon()

</script>

<template>
  <div class="flex flex-col">
    <HeaderNavbar />
    <main class="min-h-full flex-1">
      <div>
        <div class="container mx-auto p-4">
          <slot/>
        </div>
      </div>
    </main>
    <footer class="mb-4">
      <FooterCopyright />
    </footer>
    <UNotifications />
  </div>
</template>

<style lang="scss" scoped>

</style>
