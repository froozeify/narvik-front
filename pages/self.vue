<script lang="ts" setup>
  import type {Member} from "~/types/api/item/clubDependent/member";
  import {useSelfMemberStore} from "~/stores/useSelfMember";

  definePageMeta({
    layout: "member"
  });

  useHead({
    title: "Mes informations"
  })

  const selfStore = useSelfMemberStore()

  await selfStore.refresh()
  const self: Ref<Member | undefined> = ref(selfStore.member)
</script>

<template>
  <div>
    <MemberDetails v-if="self" :member="self" />
  </div>
</template>
