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
  <div class="grid grid-cols-1 sm:grid-cols-6 gap-4">
    <UCard class="sm:col-span-4">
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
            <b>Statut</b> : <span :class="selfStore.selectedProfile.club.isActivated ? '' : 'text-error-500'">{{ selfStore.selectedProfile.club.isActivated ? 'Actif' : 'Non actif' }}</span>
          </p>

          <p v-if="selfStore.selectedProfile.club.renewDate">
            <b>Date de renouvellement</b> : {{ formatDateReadable(selfStore.selectedProfile.club.renewDate.toString()) }}
          </p>


          <UCard class="mt-4">
            <ClubSubscriptionList :item="selfStore.selectedProfile.club" />
          </UCard>
        </div>
      </div>
    </UCard>

    <GenericCard v-if="selfStore.selectedProfile?.club" class="sm:col-span-2" title="Facturation">
      <div class="mb-4">
        <p v-if="selfStore.selectedProfile.club.contactName">
          <b>Nom</b> : {{ selfStore.selectedProfile.club.contactName }}
        </p>
        <p v-if="selfStore.selectedProfile.club.contactEmail">
          <b>Email</b> : {{ selfStore.selectedProfile.club.contactEmail }}
        </p>
        <p v-if="selfStore.selectedProfile.club.contactPhone">
          <b>Téléphone</b> : {{ selfStore.selectedProfile.club.contactPhone }}
        </p>
      </div>

      <div>
        <p v-if="selfStore.selectedProfile.club.address">
          <b>Adresse</b> : {{ selfStore.selectedProfile.club.address }}
        </p>
        <p v-if="selfStore.selectedProfile.club.zipCode">
          <b>Code postal</b> : {{ selfStore.selectedProfile.club.zipCode }}
        </p>
        <p v-if="selfStore.selectedProfile.club.city">
          <b>Ville</b> : {{ selfStore.selectedProfile.club.city }}
        </p>
        <p v-if="selfStore.selectedProfile.club.siret">
          <b>Siret</b> : {{ selfStore.selectedProfile.club.siret }}
        </p>
        <p v-if="selfStore.selectedProfile.club.vat">
          <b>TVA</b> : {{ selfStore.selectedProfile.club.vat }}
        </p>
      </div>
    </GenericCard>
  </div>
</template>
