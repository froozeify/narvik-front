<script setup lang="ts">

import SeasonQuery from "~/composables/api/query/SeasonQuery";
import type {Season} from "~/types/api/item/season";
import type {AgeCategory} from "~/types/api/item/ageCategory";
import AgeCategoryQuery from "~/composables/api/query/AgeCategoryQuery";

const props = defineProps(
  {
  }
)

const modal = useModal()

const seasonQuery = new SeasonQuery()
const ageCategoryQuery = new AgeCategoryQuery()

const seasons: Ref<Season[]> = ref([])
const ageCategories: Ref<AgeCategory[]> = ref([])
const selectedSeason: Ref<string | undefined> = ref(undefined)
const isSecondary: Ref<boolean> = ref(false)
const selectedAgeCategory: Ref<string | undefined> = ref(undefined)


const emit = defineEmits(['selected'])

seasonQuery.getAll().then( (value) => {
  seasons.value = value.items
  selectedSeason.value = value.items[0]["@id"] // We set the latest season by default
})

ageCategoryQuery.getAll().then((value) => {
  ageCategories.value = value.items
})

</script>

<template>
  <ModalWithActions title="Sélection d'une saison">

    <UFormGroup label="Saison">
      <USelect v-model="selectedSeason" :options="seasons" option-attribute="name" value-attribute="@id" />
    </UFormGroup>


    <UFormGroup label="Club secondaire">
      <UToggle v-model="isSecondary" />
    </UFormGroup>

    <UFormGroup label="Catégorie d'âge">
      <USelect v-model="selectedAgeCategory" :options="ageCategories" option-attribute="name" value-attribute="@id" />
    </UFormGroup>

    <template #actions>
      <UButton
        @click="emit('selected', selectedSeason, isSecondary, selectedAgeCategory); modal.close();"
      >
        Sélectionner
      </UButton>
    </template>
  </ModalWithActions>
</template>

<style scoped lang="scss">

</style>
