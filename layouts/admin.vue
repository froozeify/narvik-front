<script setup lang="ts">
  import {useSetSiteFavicon} from "~/composables/image";
  import {useSelfMemberStore} from "~/stores/useSelfMember";
  import type {GroupedNavigationLinks} from "~/types/groupedNavigationLinks";

  useHead({
    titleTemplate: (titleChunk) => {
      return titleChunk ? `${titleChunk} - Administration - Narvik` : 'Administration - Narvik';
    }
  });

  useSetSiteFavicon()

  const selfStore = useSelfMemberStore()

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
    },
    {
      label: 'Email',
      icon: 'i-heroicons-envelope',
      to: '/admin/config/email'
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
      to: '/admin/imports/itac'
    },
    {
      label: 'Club secondaire',
      icon: 'i-heroicons-user-plus',
      to: '/admin/imports/itac-secondary-club'
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
    <slot></slot>
  </GenericLayoutAdmin>
</template>

<style lang="scss" scoped>

</style>
