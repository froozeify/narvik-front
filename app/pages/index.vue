<script setup lang="ts">

import {useSelfUserStore} from "~/stores/useSelfUser";

definePageMeta({
  layout: "member"
});

const selfStore = useSelfUserStore();
const { selectedProfile } = storeToRefs(selfStore)
const isBadger = selfStore.isBadger()

useHead({
  title: selectedProfile.value?.club.presencesEnabled ? 'Gestion de présences' : ''
})

if (!isBadger && !selectedProfile.value?.club.presencesEnabled) {
  navigateTo('/admin')
}

</script>

<template>
  <div v-if="isBadger || selectedProfile?.club.presencesEnabled">
    <ErrorModuleNotEnabled v-if="!selfStore.selectedProfile?.club.presencesEnabled" />
    <PresentMemberTodayList />
  </div>
</template>


<style lang="css" scoped>

</style>
