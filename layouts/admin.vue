<script setup lang="ts">
  import {useSetSiteFavicon} from "~/composables/image";
  import {useSelfMemberStore} from "~/stores/useSelfMember";
  import type {GroupedNavigationLinks} from "~/types/groupedNavigationLinks";

  useHead({
    titleTemplate: (titleChunk) => {
      return titleChunk ? `${titleChunk} - Adminstration - Narvik` : 'Adminstration - Narvik';
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

  if (isAdmin) {
    globalSection.push(
      {
        label: 'Configuration globale',
        icon: 'i-heroicons-wrench-screwdriver',
        to: '/admin/config'
      }
    )

    entitiesSection.unshift(
{
        label: 'Activités',
        icon: 'i-heroicons-rocket-launch',
        to: '/admin/activities'
      }
    )
  }

  let links: GroupedNavigationLinks[] = [
    {
      links: globalSection
    },
    {
      title: '',
      links: entitiesSection
    }
  ]

  if (isAdmin) {
    links.push({
      title: 'Imports',
      links: importSection
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
