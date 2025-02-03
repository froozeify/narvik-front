<script setup lang="ts">
  import {useSelfUserStore} from "~/stores/useSelfUser";
  import {useAppConfigStore} from "~/stores/useAppConfig";
  import {isDarkMode, isDesktop, isTablet, watchBreakpoint} from "~/utils/browser";

  const selfStore = useSelfUserStore();
  const appConfigStore = useAppConfigStore();

  const isDark = isDarkMode()

  const { selectedProfile } = storeToRefs(selfStore)

  // const, to avoid it being reactive and login back user
  const isAdmin = selfStore.isAdmin()
  const isBadger = selfStore.isBadger()
  const isSupervisor = computed(() => {
    return selfStore.hasSupervisorRole() && selectedProfile.value
  })

  const isDesktopDisplay = isDesktop()
  const isTabletDisplay = isTablet()

  const siteLogo: Ref<string> = appConfigStore.getLogo()

  const rightMenu = [
    [{
      label: !isBadger ? 'Profil' : 'Pointeuse',
      avatar: {
        icon: 'i-heroicons-user',
        size: 'xs',
        src: selfStore.member?.profileImageBase64,
        ui: {
          rounded: 'object-contain bg-gray-100 dark:bg-gray-800'
        }
      },
      to: !isBadger ? "/self" : ''
    }], [{
      slot: 'darkMode',
      label: 'Thème',
      click: () => {
        isDark.value = !isDark.value
      }
    }, {
      label: 'Déconnexion',
      icon: 'i-heroicons-arrow-right-start-on-rectangle-20-solid',
      click: () => {
        selfStore.logout()
      }
    }]
  ]

  if (selfStore.isSuperAdmin()) {
    rightMenu.unshift([
      {
        label: 'Administration global',
        icon: 'i-heroicons-building-library',
        to: "/super-admin"
      }
    ]);
  }

  onMounted(() => {
    watchBreakpoint()
    window.addEventListener('resize', watchBreakpoint)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', watchBreakpoint)
  })
</script>

<template>
  <header
    class="backdrop-blur -mb-px sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 h-16 print:hidden">
    <nav class="container mx-auto p-4 flex justify-between h-full overflow-y-auto">
      <div class="flex gap-4 flex-shrink-0">
        <NuxtLink to="/" class="flex align-middle">
          <UTooltip text="Accueil">
            <NuxtImg v-if="selectedProfile?.club?.settings.logoBase64" :src="selectedProfile.club.settings.logoBase64" class="w-7 object-contain"/>
            <NuxtImg v-else :src="siteLogo" class="w-7 object-contain"/>
          </UTooltip>
        </NuxtLink>
        <UButton class="-mx-3 hidden lg:block" to="/" variant="ghost" color="gray">Accueil</UButton>
        <div v-if="isSupervisor">
          <UButton to="/admin/sales/new" icon="i-heroicons-shopping-cart" variant="ghost" color="gray">Vente</UButton>
        </div>
      </div>
      <div class="flex gap-4">
        <div v-if="isSupervisor">
          <UButton to="/admin" icon="i-heroicons-key" variant="ghost" color="gray">Administration</UButton>
        </div>
        <div v-if="selfStore.isImpersonating">
          <UButton color="orange" @click="selfStore.stopImpersonation()">Arrêter impersonification</UButton>
        </div>
        <UDropdown :items="rightMenu">
          <UButton
            variant="ghost"
            color="gray"
            :label="(isDesktopDisplay || isTabletDisplay) ? (!isBadger ? selectedProfile?.displayName : 'Pointeuse') : undefined">
            <template #trailing>
              <UAvatar v-if="!isBadger"
                       size="xs"
                       :alt="selfStore.member?.fullName"
                       :src="selfStore.member?.profileImageBase64"
              />
              <UIcon v-else
                     name="i-heroicons-clock"
              />
            </template>
          </UButton>
          <template #darkMode>
              <UIcon
                :name="isDark ? 'i-heroicons-moon-20-solid' : 'i-heroicons-sun-20-solid'"
                class="flex-shrink-0 w-5 h-5 text-gray-400 dark:text-gray-500"
                />
              <span>
                {{ isDark ? 'Thème sombre' : 'Thème clair' }}
              </span>
          </template>
        </UDropdown>
      </div>
    </nav>
  </header>
</template>

<style scoped lang="scss">
li {
  display: flex;
  align-items: center;
}
</style>
