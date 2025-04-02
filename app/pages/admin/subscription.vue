<script lang="ts" setup>

import {useSelfUserStore} from "~/stores/useSelfUser";
import {formatDateReadable} from "~/utils/date";
import {ClubRole, getAvailableClubRoles} from "~/types/api/item/club";

definePageMeta({
  layout: "admin"
});

const selfStore = useSelfUserStore()


</script>

<template>
  <div>
    <UCard>
      <div class="flex gap-2 flex-row flex-wrap">
        <div class="text-xl font-bold">Information sur l'abonnement</div>
        <div class="flex-1"></div>
        <div class="flex justify-end">
          <!-- <UButton @click="" icon="i-heroicons-plus"></UButton> -->
        </div>
      </div>

      <div>
        <p class="text-sm my-2">
          Pour toutes modifications à propos de vos informations de contact ou de votre abonnement, vous pouvez prendre contact avec nous en vous rendant à l'adresse suivante : <ContentLink to="https://about.narvik.app/contact" target="_blank">https://about.narvik.app/contact</ContentLink>
        </p>

        <div v-if="!selfStore.selectedProfile?.club">
          <UAlert
            color="error"
            title="Impossible d'obtenir les informations sur le club."
            description="Veuillez rafraichir la page ou vous reconnecter si cela ne corrige pas le problème."
          />
        </div>
        <div v-else>
          <p>
            <b>Statut</b> : <span :class="selfStore.selectedProfile.club.isActivated ? '' : 'text-red-500'">{{ selfStore.selectedProfile.club.isActivated ? 'Actif' : 'Non actif' }}</span>
          </p>
          <p v-if="selfStore.selectedProfile.club.renewDate">
            <b>Date de renouvellement</b> : {{ formatDateReadable(selfStore.selectedProfile.club.renewDate.toString()) }}
          </p>
          <p v-if="selfStore.selectedProfile.club.contactName">
            <b>Nom du contact</b> : {{ selfStore.selectedProfile.club.contactName }}
          </p>
          <p v-if="selfStore.selectedProfile.club.contactEmail">
            <b>Email de contact</b> : {{ selfStore.selectedProfile.club.contactEmail }}
          </p>
          <p v-if="selfStore.selectedProfile.club.contactPhone">
            <b>Téléphone</b> : {{ selfStore.selectedProfile.club.contactPhone }}
          </p>

          <UCard class="mt-4">
            <ClubSubscriptionList :item="selfStore.selectedProfile.club" />
          </UCard>
        </div>
      </div>
    </UCard>
  </div>
</template>
