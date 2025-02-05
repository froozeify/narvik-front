<script lang="ts" setup>
  import type {Member} from "~/types/api/item/clubDependent/member";
  import {useSelfUserStore} from "~/stores/useSelfUser";
  import ModalDeleteConfirmation from "~/components/Modal/ModalDeleteConfirmation.vue";
  import ModalSelectProfile from "~/components/Modal/ModalSelectProfile.vue";

  definePageMeta({
    layout: "member"
  });

  useHead({
    title: "Mes informations"
  })

  const modal = useModal()

  const selfStore = useSelfUserStore()
  const { member, user, selectedProfile } = storeToRefs(selfStore)
  selfStore.refresh()
</script>

<template>
  <div>
    <div class="flex flex-col md:flex-row justify-between">
      <div v-if="selectedProfile?.club" class="text-xl font-bold">{{ selectedProfile?.club.name }}</div>
      <div class="flex-1"></div>
      <UButton
        v-if="(user?.linkedProfiles?.length ?? 0) > 1"
        color="yellow"
        @click="modal.open(ModalSelectProfile)">
        Changer de profil
      </UButton>
    </div>
    <MemberDetails v-if="member" :member="member" />
    <UCard v-else class="text-center">
      <div class="text-xl font-bold">Compte liée à aucun club</div>
      <p>Veuillez vous assurer que l'adresse mail du compte correspond à celle enregistré auprès de votre club</p>
    </UCard>
  </div>
</template>
