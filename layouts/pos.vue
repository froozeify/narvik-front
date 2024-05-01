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
      label: 'Ventes',
      icon: 'i-heroicons-shopping-cart',
      to: '/admin/sales'
    },
    {
      label: 'Faire une vente',
      icon: 'i-heroicons-banknotes',
      to: '/admin/sales/new'
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
    }
  ]

  let links = [
    salesSection
  ]

  if (isAdmin) {
    links.push(inventorySection)
  }

</script>

<template>
  <div class="flex flex-col">
    <HeaderNavbar/>
    <main class="min-h-full flex-1">
      <div class="container mx-auto p-4">
        <div class="flex flex-col lg:grid lg:grid-cols-10 lg:gap-8">
          <div class="mb-4 lg:col-span-3 xl:col-span-2 print:hidden">
            <UVerticalNavigation
                :links="links"
                :ui="{
                  wrapper: 'border-s border-gray-200 dark:border-gray-800 space-y-2 sticky top-20',
                  base: 'group block border-s -ms-px lg:leading-6 before:hidden inline-flex',
                  padding: 'p-0 ps-4',
                  rounded: '',
                  font: '',
                  ring: '',
                  active: 'text-primary-500 dark:text-primary-400 border-current font-semibold',
                  inactive: 'border-transparent hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300',
                  label: '',
                  icon: {
                    base: 'flex-shrink-0 w-4 h-4 mr-4',
                    active: 'text-gray-700 dark:text-gray-200',
                    inactive: 'text-gray-400 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-200'
                  }
                }"
            />

          </div>
          <div class="lg:col-span-7 xl:col-span-8">
            <slot/>
          </div>
        </div>

      </div>
    </main>
    <footer class="mb-4">
      <FooterCopyright />
    </footer>
    <UNotifications/>
  </div>
</template>

<style lang="scss" scoped>

</style>
