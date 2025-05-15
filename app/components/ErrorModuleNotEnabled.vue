<script setup lang="ts">

</script>

<template>
  <UAlert
    class="mb-4"
    icon="i-heroicons-link-slash"
    color="error"
    variant="subtle"
    title="Lecture seule. Fonctionnalité non souscrite."
  >
    <template #description>
      <p>Pour pouvoir l'utiliser veuillez modifier <ContentLink to="/admin/subscription" :underline="true">votre abonnement</ContentLink>.</p>
    </template>
  </UAlert>
</template>

<style scoped lang="css">

</style>
