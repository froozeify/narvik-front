<script setup lang="ts">

definePageMeta({
  layout: "admin"
});

useHead({
  title: 'Liste des membres'
})

</script>

<template>
  <div>
    <UCard>
      <MemberList />
    </UCard>
  </div>
</template>


<style lang="scss" scoped>

</style>

