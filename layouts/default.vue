<script setup lang="ts">
import FooterCopyright from "~/components/FooterCopyright.vue";
</script>

<template>
  <div>
    <main class="min-h-full h-full flex justify-center items-center">
      <div class="container m-auto p-4 md:p-12 md:max-w-screen-md">
        <slot/>
      </div>
    </main>
    <footer class="print:hidden mb-4">
      <FooterCopyright :display-version="false" />
    </footer>
    <UNotifications />
  </div>
</template>

<style lang="scss" scoped>

</style>
