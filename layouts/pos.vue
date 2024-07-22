<script setup lang="ts">
  import {useSetSiteFavicon} from "~/composables/image";
  import {useSelfMemberStore} from "~/stores/useSelfMember";
  import FooterCopyright from "~/components/FooterCopyright.vue";

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
    },
    {
      label: 'Historique par articles',
      icon: 'i-heroicons-shopping-cart',
      to: '/admin/sales'
    },
    {
      label: 'Historique',
      icon: 'i-heroicons-receipt-refund',
      to: '/admin/sales/history'
    }
  ]

  const historySection = [
    {
      label: 'Historique',
      labelClass: 'font-bold pb-2 pointer-events-none'
    },
    {
      label: 'Historique par articles',
      icon: 'i-heroicons-shopping-cart',
      to: '/admin/sales'
    },
    {
      label: 'Historique',
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
      label: 'Catégorie',
      icon: 'i-heroicons-tag',
      to: '/admin/inventories/categories'
    },
    {
      label: 'Moyen de paiement',
      icon: 'i-heroicons-credit-card',
      to: '/admin/sales/payment-modes'
    }
  ]

  let links = [
    salesSection,
    historySection
  ]

  if (isAdmin) {
    links.push(inventorySection)
  }

</script>

<template>
  <GenericLayoutAdmin :links="links">
    <slot/>
  </GenericLayoutAdmin>
</template>

<style lang="scss" scoped>

</style>
