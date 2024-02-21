<script setup lang="ts">
  import {useImageLogo, useLoadImageLogo} from "~/composables/image";

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
    <main class="min-h-full h-screen flex justify-center items-center">
      <div class="container m-auto p-12 md:max-w-screen-md">
        <slot/>
      </div>
    </main>
    <UNotifications />
  </div>
</template>

<style lang="scss" scoped>

</style>
