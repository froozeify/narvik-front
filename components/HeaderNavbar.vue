<script setup lang="ts">
import {useSelfMemberStore} from "~/stores/useSelfMember";

  const colorMode = useColorMode()
  const selfStore = useSelfMemberStore();

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

</script>

<template>
  <header class="bg-background/75 backdrop-blur border-b -mb-px sticky top-0 z-50 border-gray-200 dark:border-gray-800 h-16 print:hidden">
    <nav class="container mx-auto p-4 flex justify-between h-full">
      <ul class="flex gap-4">
        <li><NuxtLink to="/">Accueil</NuxtLink></li>
        <li v-if="isSupervisor"><NuxtLink to="/admin">Administration</NuxtLink></li>
      </ul>
      <ul class="flex gap-4">
        <li>
          <UButton
              :icon="isDark ? 'i-heroicons-moon-20-solid' : 'i-heroicons-sun-20-solid'"
              color="gray"
              variant="ghost"
              aria-label="Theme"
              @click="isDark = !isDark"
          />
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
