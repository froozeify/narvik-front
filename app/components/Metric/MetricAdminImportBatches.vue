<script lang="ts" setup>
import {useSelfUserStore} from "~/stores/useSelfUser";

const selfStore =  useSelfUserStore()
const { selectedProfile } = useSelfUserStore()

const itacImportRemaining: Ref<number | undefined> = ref(undefined)
const itacSecondaryImportRemaining: Ref<number | undefined> = ref(undefined)
const cerbereImportRemaining: Ref<number | undefined> = ref(undefined)


function refreshMetrics() {
  selfStore.refreshSelectedClubSettings()
  itacImportRemaining.value = selectedProfile?.club.settings.itacImportRemaining
  itacSecondaryImportRemaining.value = selectedProfile?.club.settings.itacSecondaryImportRemaining
  cerbereImportRemaining.value = selectedProfile?.club.settings.cerbereImportRemaining
}

let refreshInterval: NodeJS.Timeout
refreshMetrics()
onMounted(() => {
  refreshInterval = setInterval(() => {
    refreshMetrics()
  }, 5000)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<template>
  <div>

    <UAlert v-if="(itacImportRemaining??0) > 0 || (itacSecondaryImportRemaining??0) > 0 || (cerbereImportRemaining??0) > 0"
            class="mb-4"
            variant="subtle"
            icon="i-heroicons-exclamation-triangle"
            color="warning"
            title="Des imports sont en cours"
    >
      <template #description>
        <p v-if="itacImportRemaining && itacImportRemaining >0">Membres : {{ itacImportRemaining }} lots restants</p>
        <p v-if="itacSecondaryImportRemaining && itacSecondaryImportRemaining >0">Membres club secondaire : {{ itacSecondaryImportRemaining }} lots restants</p>
        <p v-if="cerbereImportRemaining && cerbereImportRemaining >0">Cerbère : {{ cerbereImportRemaining }} lots restants</p>
      </template>
    </UAlert>

  </div>
</template>
