<script setup lang="ts">
  import {useSelfUserStore} from "~/stores/useSelfUser";
  import type {GroupedNavigationLinks} from "~/types/groupedNavigationLinks";

  useHead({
    titleTemplate: (titleChunk) => {
      return titleChunk ? `${titleChunk} - Administration - Narvik` : 'Administration - Narvik';
    }
  });

  const selfStore = useSelfUserStore()

  const isAdmin = selfStore.isAdmin()
  const isSupervisor = selfStore.hasSupervisorRole()

  const globalSection = [
    {
      label: 'Accueil',
      icon: 'i-heroicons-home',
      to: '/admin'
    }
  ]

  const configsSection = [
    {
      label: 'Globale',
      icon: 'i-heroicons-wrench-screwdriver',
      to: '/admin/config'
    },
    {
      label: 'Activités',
      icon: 'i-heroicons-rocket-launch',
      to: '/admin/config/activities'
    }
  ]

  const entitiesSection = [
    {
      label: 'Présences',
      icon: 'i-heroicons-calendar-days',
      to: '/admin/presences'
    },
    {
      label: 'Membres',
      icon: 'i-heroicons-user-group',
      to: '/admin/members'
    },
    {
      label: 'Trombinoscope',
      icon: 'i-heroicons-face-smile',
      to: '/admin/thrombinoscope'
    }
  ]

  const importSection = [
    {
      label: 'Membres',
      icon: 'i-heroicons-users',
      to: '/admin/imports/members'
    },
    {
      label: 'Photos',
      icon: 'i-heroicons-photo',
      to: '/admin/imports/photos'
    },
    {
      label: 'Présences',
      icon: 'i-heroicons-calendar-days',
      to: '/admin/imports/presences'
    },
  ]

  let links: GroupedNavigationLinks[] = [
    {
      links: globalSection
    },
    {
      title: '',
      links: entitiesSection
    },
  ]

  if (isAdmin) {
    links.push({
      title: 'Imports',
      links: importSection
    })

    links.push({
      title: 'Configurations',
      links: configsSection,
    })
  }
</script>

<template>
  <GenericLayoutAdmin :links="links">
    <UAlert
      v-if="!selfStore.selectedProfile?.club.isActivated"
      class="mb-4"
      icon="i-heroicons-link-slash"
      color="red"
      variant="subtle"
      title="Lecture seule. Club non activé."
      description="Le club n'est pas activé, aucune modification ne sera possible. Veuillez contacter le support pour plus d'information."
    />
    <slot></slot>
  </GenericLayoutAdmin>
</template>

<style lang="scss" scoped>

</style>
