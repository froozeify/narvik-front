<script lang="ts" setup>
import {useImageLogo, useLoadImageLogo} from "~/composables/image";


useHead({
  titleTemplate: (title) => {
    return title ? `${title} - Narvik` : 'Narvik'
  }
})

useLoadImageLogo()

watch(useImageLogo, (newValue, oldValue) => {
  if (newValue && newValue.mimeType && newValue.base64) {
    useHead({
      link: [
        {
          rel: 'icon',
          type: newValue.mimeType,
          href: newValue.base64
        }
      ]
    })
  }
})

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
