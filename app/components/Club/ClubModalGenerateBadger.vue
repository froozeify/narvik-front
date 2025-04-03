<script setup lang="ts">

import ClubQuery from "~/composables/api/query/ClubQuery";

const emit = defineEmits(['generated', 'close'])

async function generateBadger() {
  const clubQuery = new ClubQuery()
  const { updated } = await clubQuery.generateBadger()
  if (updated) {
    emit("generated", updated)
    emit('close', true)
  }
}

</script>

<template>
  <ModalWithActions title="Génération d'un nouveau lien" @close="(state: boolean) => emit('close', state)">

    <UAlert
      icon="i-heroicons-megaphone"
      class="my-4"
      color="error"
      variant="soft"
      title="Une fois la génération effectué, l'ancien lien ne fonctionnera plus."
    />

    <template #actions>
      <UButton
        @click="generateBadger()"
      >
        Générer
      </UButton>
    </template>
  </ModalWithActions>
</template>

<style scoped lang="css">

</style>
