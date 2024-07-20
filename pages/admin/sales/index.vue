<script setup lang="ts">
  definePageMeta({
    layout: "pos"
  });

  useHead({
    title: 'Vente'
  })
</script>

<template>
  <SaleList :today="true" />
</template>

<style scoped lang="scss">

</style>
