<script setup lang="ts">
  import {useSelfMemberStore} from "~/stores/useSelfMember";
  import type {Image} from "~/types/api/item/image";
  import {useAppConfigStore} from "~/stores/useAppConfig";
  import {isDesktop, watchBreakpoint} from "~/utils/browser";

  const colorMode = useColorMode()
  const selfStore = useSelfMemberStore();
  const appConfigStore = useAppConfigStore();

  const isDark = computed({
    get() {
      return colorMode.value === 'dark'
    },
    set() {
      colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
    }
  });

  // const, to avoid it being reactive and login back user
  const isAdmin = selfStore.isAdmin()
  const isBadger = selfStore.isBadger()
  const isSupervisor = selfStore.hasSupervisorRole()

  const isDesktopDisplay = isDesktop()
  const isTabletDisplay = isTablet()

  const siteLogo: Ref<Image | null> = appConfigStore.getLogo()

  const rightMenu = [
    [{
      label: !isBadger ? 'Profil' : 'Pointeuse',
      avatar: {
        icon: 'i-heroicons-user',
        size: 'xs',
        src: selfStore.member?.profileImageBase64
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
        <div>
          <NuxtLink v-if="siteLogo" to="/" class="flex align-middle">
            <UTooltip text="Accueil">
              <img :src="siteLogo.base64" class="w-7"/>
            </UTooltip>
          </NuxtLink>
        </div>
        <UButton class="-mx-3 hidden lg:block" to="/" variant="ghost" color="gray">Accueil</UButton>
        <div v-if="isSupervisor">
          <UButton to="/admin/sales/new" icon="i-heroicons-shopping-cart" variant="ghost" color="gray">Vente</UButton>
        </div>
      </div>
      <div class="flex gap-4">
        <div v-if="isSupervisor">
          <UButton to="/admin" icon="i-heroicons-key" variant="ghost" color="gray">Administration</UButton>
        </div>
        <UDropdown :items="rightMenu">
          <UButton
            variant="ghost"
            color="gray"
            :label="(isDesktopDisplay || isTabletDisplay) ? (!isBadger ? selfStore.member?.fullName : 'Pointeuse') : undefined">
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
