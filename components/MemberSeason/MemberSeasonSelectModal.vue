<script setup lang="ts">

import SeasonQuery from "~/composables/api/query/SeasonQuery";
import type {Season} from "~/types/api/item/season";

const props = defineProps(
  {
  }
)

const modal = useModal()

const seasonQuery = new SeasonQuery()
const seasons: Ref<Season[]> = ref([])
const selectedSeason: Ref<string | undefined> = ref(undefined)

const emit = defineEmits(['selected'])

seasonQuery.getAll().then( (value) => {
  seasons.value = value.items
  selectedSeason.value = value.items[0]["@id"] // We set the latest season by default
})

</script>

<template>
  <ModalWithActions title="Sélectioner une saison">

    <USelect v-model="selectedSeason" :options="seasons" option-attribute="name" value-attribute="@id" />

    <template #actions>
      <UButton
        @click="emit('selected', selectedSeason); modal.close();"
      >
        Sélectionner
      </UButton>
    </template>
  </ModalWithActions>
</template>

<style scoped lang="scss">

</style>
