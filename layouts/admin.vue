<script setup>
  import {useSelfMemberStore} from "~/stores/useSelfMember";

  useHead({
    titleTemplate: (titleChunk) => {
      return titleChunk ? `${titleChunk} - Adminstration - Narvik` : 'Adminstration - Narvik';
    }
  });

  const selfStore = useSelfMemberStore();

  const isAdmin = selfStore.isAdmin()
  const isSupervisor = selfStore.hasSupervisorRole()

  const globalSection = [
    {
      label: 'Accueil admin',
      icon: 'i-heroicons-home',
      to: '/admin'
    }
  ]

  const entitiesSection = [
    {
      label: 'Membres',
      icon: 'i-heroicons-user-group',
      to: '/admin/members'
    }
  ]

  const importSection = [
    {
      label: 'Import membres itac',
      icon: 'i-heroicons-users',
      to: '/admin/imports/itac'
    },
    {
      label: 'Import photos',
      icon: 'i-heroicons-photo',
      to: '/admin/imports/photos'
    }
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

  let links = [
    globalSection,
    entitiesSection
  ]

  if (isAdmin) {
    links.push(importSection)
  }
</script>

<template>
  <div>
    <HeaderNavbar/>
    <main class="min-h-full">
      <div class="container mx-auto p-4">
        <div class="flex flex-col lg:grid lg:grid-cols-10 lg:gap-8">
          <div class="lg:col-span-2">
            <UVerticalNavigation
                :links="links"
                :ui="{
                  wrapper: 'border-s border-gray-200 dark:border-gray-800 space-y-2 sticky top-20',
                  base: 'group block border-s -ms-px lg:leading-6 before:hidden',
                  padding: 'p-0 ps-4',
                  rounded: '',
                  font: '',
                  ring: '',
                  active: 'text-primary-500 dark:text-primary-400 border-current font-semibold',
                  inactive: 'border-transparent hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300',
                  icon: {
                    base: 'flex-shrink-0 w-4 h-4 mr-4',
                    active: 'text-gray-700 dark:text-gray-200',
                    inactive: 'text-gray-400 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-200'
                  }
                }"
            />

          </div>
          <div class="lg:col-span-8">
            <slot/>
          </div>
        </div>

      </div>
    </main>
    <UNotifications/>
  </div>
</template>

<style lang="scss" scoped>

</style>
