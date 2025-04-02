<script setup lang="ts">

definePageMeta({
  layout: "admin"
});

useHead({
  title: 'Gestion des présences'
})

</script>

<template>
  <div>
    <PresenceList :list-only="false" />
  </div>
</template>


<style lang="css" scoped>

</style>

