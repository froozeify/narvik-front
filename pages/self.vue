<script lang="ts" setup>
  import type {Member} from "~/types/api/item/clubDependent/member";
  import {useSelfUserStore} from "~/stores/useSelfUser";

  definePageMeta({
    layout: "member"
  });

  useHead({
    title: "Mes informations"
  })

  const selfStore = useSelfUserStore()
  const self: Ref<Member | undefined> = ref(selfStore.member)

  selfStore.refresh()
</script>

<template>
  <div>
    <MemberDetails v-if="self" :member="self" />
  </div>
</template>
