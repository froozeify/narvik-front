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
  const { member } = storeToRefs(selfStore)
  selfStore.refresh()
</script>

<template>
  <div>
    <MemberDetails v-if="member" :member="member" />
    <UCard v-else class="text-center">
      <div class="text-xl font-bold">Compte liée à aucun club</div>
      <p>Veuillez vous assurer que l'adresse mail du compte correspond à celle enregistré auprès de votre club</p>
    </UCard>
  </div>
</template>
