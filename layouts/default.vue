<script setup lang="ts">
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
