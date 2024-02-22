<script lang="ts" setup>
import {useSetSiteFavicon} from "~/composables/image";


useHead({
  titleTemplate: (title) => {
    return title ? `${title} - Narvik` : 'Narvik'
  }
})

useSetSiteFavicon()

</script>

<template>
  <div>
    <HeaderNavbar />
    <main class="min-h-full">
      <div>
        <div class="container mx-auto p-4">
          <slot/>
        </div>
      </div>
    </main>
    <UNotifications />
  </div>
</template>

<style lang="scss" scoped>

</style>
