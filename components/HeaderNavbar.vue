<script setup lang="ts">
  import {useSelfMemberStore} from "~/stores/useSelfMember";
  import type {Image} from "~/types/image";
  import {useAppConfigStore} from "~/stores/useAppConfig";

  const colorMode = useColorMode()
  const selfStore = useSelfMemberStore();
  const appConfigStore = useAppConfigStore();

  const isDark = computed({
    get () {
      return colorMode.value === 'dark'
    },
    set () {
      colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
    }
  });

  // const, to avoid it being reactive and login back user
  const isAdmin = selfStore.isAdmin()
  const isBadger = selfStore.isBadger()
  const isSupervisor = selfStore.hasSupervisorRole()

  const siteLogo: Ref<Image|null> = appConfigStore.getLogo()
</script>

<template>
  <header class="bg-background/75 backdrop-blur border-b -mb-px sticky top-0 z-50 border-gray-200 dark:border-gray-800 h-16 print:hidden">
    <nav class="container mx-auto p-4 flex justify-between h-full">
      <ul class="flex gap-4">
        <li>
          <NuxtLink to="/" class="flex align-middle">
            <span v-if="!siteLogo">Accueil</span>
            <UTooltip v-else
              text="Accueil"
            >
              <img :src="siteLogo.base64" class="w-7" />
            </UTooltip>
          </NuxtLink>
        </li>
        <li v-if="isSupervisor"><UButton to="/admin/sales" icon="i-heroicons-shopping-cart" variant="ghost" color="gray">Vente</UButton></li>
      </ul>
      <ul class="flex gap-4">
        <li v-if="isSupervisor"><UButton to="/admin" icon="i-heroicons-key" variant="ghost" color="gray">Administration</UButton></li>
        <li>
          <UTooltip text="Mode clair/sombre">
            <UButton
                :icon="isDark ? 'i-heroicons-moon-20-solid' : 'i-heroicons-sun-20-solid'"
                color="gray"
                variant="ghost"
                aria-label="Theme"
                @click="isDark = !isDark"
            />
          </UTooltip>
        </li>
        <li v-if="!isBadger">
          <UButton
              icon="i-heroicons-user-circle-solid"
              color="gray"
              variant="ghost"
              to="/self"
          />
        </li>
        <li>
          <UTooltip text="Déconnexion">
            <UButton
                icon="i-heroicons-arrow-right-start-on-rectangle-20-solid"
                color="gray"
                variant="ghost"
                aria-label="Déconnexion"
                @click="selfStore.logout()"
            />
          </UTooltip>
        </li>
      </ul>
    </nav>
  </header>
</template>

<style scoped lang="scss">
  li {
    display: flex;
    align-items: center;
  }
</style>
