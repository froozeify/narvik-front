<script setup lang="ts">

import SeasonQuery from "~/composables/api/query/SeasonQuery";
import type {Season} from "~/types/api/item/season";
import type {AgeCategory} from "~/types/api/item/ageCategory";
import AgeCategoryQuery from "~/composables/api/query/AgeCategoryQuery";
import type {SelectApiItem} from "~/types/select";

const seasonQuery = new SeasonQuery()
const ageCategoryQuery = new AgeCategoryQuery()

const seasons: Ref<Season[]> = ref([])
const ageCategories: Ref<AgeCategory[]> = ref([])
const selectedSeason: Ref<string | undefined> = ref(undefined)
const isSecondary: Ref<boolean> = ref(false)
const selectedAgeCategory: Ref<string | undefined> = ref(undefined)

const emit = defineEmits(['selected', 'close'])

const seasonsSelect = computed( () => {
  const items: SelectApiItem<Season>[] = []
  seasons.value.forEach(value => {
    items.push({
      label: value.name,
      value: value["@id"]
    })
  })
  return items;
})

const ageCategoriesSelect = computed( () => {
  const items: SelectApiItem<AgeCategory>[] = []
  ageCategories.value.forEach(value => {
    items.push({
      label: value.name,
      value: value["@id"]
    })
  })
  return items;
})

seasonQuery.getAll().then( (value) => {
  seasons.value = value.items
  selectedSeason.value = value.items[0]["@id"] // We set the latest season by default
})

ageCategoryQuery.getAll().then((value) => {
  ageCategories.value = value.items
})

</script>

<template>
  <ModalWithActions title="Sélection d'une saison" @close="(state: boolean) => emit('close', state)">

    <UFormField label="Saison">
      <USelect v-model="selectedSeason" :items="seasonsSelect" value-attribute="@id" />
    </UFormField>

    <UFormField label="Club secondaire">
      <USwitch v-model="isSecondary" />
    </UFormField>

    <UFormField label="Catégorie d'âge">
      <USelect v-model="selectedAgeCategory" :items="ageCategoriesSelect" />
    </UFormField>

    <template #actions>
      <UButton
        @click="emit('selected', selectedSeason, isSecondary, selectedAgeCategory); emit('close', true);"
      >
        Sélectionner
      </UButton>
    </template>
  </ModalWithActions>
</template>

<style scoped lang="css">

</style>
