<script setup lang="ts">
  import {useSetSiteFavicon} from "~/composables/image";
  import {useSelfMemberStore} from "~/stores/useSelfMember";
  import FooterCopyright from "~/components/FooterCopyright.vue";
  import type {GroupedNavigationLinks} from "~/types/groupedNavigationLinks";

  useHead({
    titleTemplate: (titleChunk) => {
      return titleChunk ? `${titleChunk} - POS - Narvik` : 'POS - Narvik';
    }
  });

  useSetSiteFavicon()

  const selfStore = useSelfMemberStore()
  const isAdmin = selfStore.isAdmin()
  const isSupervisor = selfStore.hasSupervisorRole()

  const salesSection = [
    {
      label: 'Faire une vente',
      icon: 'i-heroicons-banknotes',
      to: '/admin/sales/new'
    }
  ]

  const historySection = [
    {
      label: 'Par Articles',
      icon: 'i-heroicons-shopping-cart',
      to: '/admin/sales'
    },
    {
      label: 'Par Ventes',
      icon: 'i-heroicons-receipt-refund',
      to: '/admin/sales/history'
    }
  ]

  const inventorySection = [
    {
      label: 'Inventaire',
      icon: 'i-heroicons-calculator',
      to: '/admin/inventories'
    },
    {
      label: 'Catégories',
      icon: 'i-heroicons-tag',
      to: '/admin/inventories/categories'
    },
    {
      label: 'Moyen de paiements',
      icon: 'i-heroicons-credit-card',
      to: '/admin/sales/payment-modes'
    }
  ]

  let links: GroupedNavigationLinks[] = [
    {
      links: salesSection
    },{
      title: 'Historique',
      links: historySection
    }
  ]

  if (isAdmin) {
    links.push({
      title: 'Gestion',
      links: inventorySection
    })
  }

</script>

<template>
  <GenericLayoutAdmin :links="links">
    <slot/>
  </GenericLayoutAdmin>
</template>

<style lang="scss" scoped>

</style>
