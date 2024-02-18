<script setup lang="ts">
  definePageMeta({
    layout: "admin"
  });

  useHead({
    title: 'Détails membre'
  })

  const route = useRoute()
  const memberId = route.params.id;
</script>

<template>
  <MemberDetails :member-id="memberId.toString()" />
</template>

<style scoped lang="scss">

</style>
