<script lang="ts" setup>
  import MemberQuery from "~/composables/api/query/clubDependent/MemberQuery";
  import type {Member} from "~/types/api/item/clubDependent/member";
  import {useSelfMemberStore} from "~/stores/useSelfMember";

  definePageMeta({
    layout: "member"
  });

  useHead({
    title: "Mes informations"
  })

  const toast = useToast()
  const selfStore = useSelfMemberStore()

  const memberQuery = new MemberQuery()
  const self: Ref<Member | undefined> = ref(selfStore.member)

  // We force a refresh for the display
  memberQuery.self().then(value => {
    if (value.retrieved && value.retrieved) {
      self.value = value.retrieved;
    } else {
      // No information on self, we force logout
      selfStore.logout();
    }
  })
</script>

<template>
  <div>
    <MemberDetails v-if="self" :member="self" />
  </div>
</template>
