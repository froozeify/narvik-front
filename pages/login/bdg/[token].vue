<script setup lang="ts">
  import {useLoginBadger} from "~/composables/api/api";
  import {useSelfUserStore} from "~/stores/useSelfUser";

  const route = useRoute()

  const selfStore = useSelfUserStore();

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
