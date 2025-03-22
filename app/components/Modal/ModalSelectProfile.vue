<script setup lang="ts">

import {useSelfUserStore} from "~/stores/useSelfUser";

const emit = defineEmits(['selected'])

const selfStore = useSelfUserStore()
const { user, member, selectedProfile } = storeToRefs(selfStore)

const selectedProfileId: Ref<string|undefined> = ref(selectedProfile.value?.id)

async function applyProfile() {
  if (!selectedProfileId.value || !user.value?.linkedProfiles) return

  const foundProfile = user.value.linkedProfiles.find( (profile) => profile.id === selectedProfileId.value)
  if (foundProfile) {
    member.value = undefined
    selectedProfile.value = foundProfile
  }

  await selfStore.refresh()
  await useModal().close()
  emit('selected')
}

</script>

<template>
  <ModalWithActions title="Choix du profil">

    <slot>
      <div>
        <USelect
          v-model="selectedProfileId"
          :options="user?.linkedProfiles"
          option-attribute="displayName"
          value-attribute="id"
          placeholder="Aucun profil défini" />
      </div>
    </slot>

    <template #actions>
      <UButton
        @click="applyProfile"
        color="yellow"
      >
        Changer
      </UButton>
    </template>
  </ModalWithActions>
</template>

<style scoped lang="scss">

</style>
