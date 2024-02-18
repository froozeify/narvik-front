<script setup lang="ts">
  import {useLoginBadger} from "~/composables/api/api";
  import {useSelfMemberStore} from "~/stores/useSelfMember";

  const route = useRoute()

  const selfStore = useSelfMemberStore();

  if (selfStore.isLogged()) {
    navigateTo('/');
  } else {
    try {
      await useLoginBadger(route.params.token);
    } catch (e) {
      navigateTo('/login')
    }

    navigateTo('/');
  }
</script>

<template>
  <div>
  </div>
</template>

<style lang="scss" scoped>

</style>
