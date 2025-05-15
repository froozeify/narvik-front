<script setup lang="ts">

import {useSelfUserStore} from "~/stores/useSelfUser";

definePageMeta({
  layout: "admin"
});

useHead({
  title: 'Gestion des présences'
})

const selfStore = useSelfUserStore();
const { selectedProfile } = storeToRefs(selfStore)

</script>

<template>
  <div>
    <ErrorModuleNotEnabled v-if="!selectedProfile?.club.presencesEnabled" />
    <PresenceList :list-only="false" />
  </div>
</template>


<style lang="css" scoped>

</style>

