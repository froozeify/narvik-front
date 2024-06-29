<script setup lang="ts">
  import {useSelfMemberStore} from "~/stores/useSelfMember";
  import type {Image} from "~/types/image";
  import {useAppConfigStore} from "~/stores/useAppConfig";

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

  const siteLogo: Ref<Image | null> = appConfigStore.getLogo()

  const rightMenuOpen = ref(false)
  const rightMenu = [
    [{
      label: !isBadger ? selfStore.member?.fullName : 'Pointeuse',
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
</script>

<template>
  <header
    class="backdrop-blur -mb-px sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 h-16 print:hidden">
    <nav class="container mx-auto p-4 flex justify-between h-full">
      <ul class="flex gap-4">
        <li>
          <NuxtLink to="/" class="flex align-middle">
            <span v-if="!siteLogo">Accueil</span>
            <UTooltip v-else
                      text="Accueil"
            >
              <img :src="siteLogo.base64" class="w-7"/>
            </UTooltip>
          </NuxtLink>
        </li>
        <li v-if="isSupervisor">
          <UButton to="/admin/sales" icon="i-heroicons-shopping-cart" variant="ghost" color="gray">Vente</UButton>
        </li>
      </ul>
      <div class="flex gap-4">
        <div v-if="isSupervisor">
          <UButton to="/admin" icon="i-heroicons-key" variant="ghost" color="gray">Administration</UButton>
        </div>
        <UButton
          variant="ghost"
          color="gray"
          trailing-icon="i-heroicons-cog-6-tooth"
          @click="rightMenuOpen = true"
        />
        <UDropdown v-model:open="rightMenuOpen" :items="rightMenu">
          <div></div><!-- Button is not here so we can use open logic on mobile. Nuxt bug otherwise. -->
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
