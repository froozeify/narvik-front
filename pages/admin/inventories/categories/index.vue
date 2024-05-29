<script setup lang="ts">

  definePageMeta({
    layout: "pos"
  });

  useHead({
    title: 'Catégorie d\'inventaire'
  })

  const selectedCategory: Ref<{id: number, weight: number, name: string} | null> = ref(null)

  const isVisible = ref(false);

  const page = ref(1);
  const itemsPerPage = ref(10);
  const sort = ref({
    column: 'weight',
    direction: 'asc'
  });
  const columns = [
    // {
    //   key: 'weight',
    //   label: 'Ordre',
    //   // sortable: true,
    //   class: 'w-12'
    // },
    {
      key: 'name',
      label: 'Nom',
      class: 'w-full'
    },
    {
      key: 'actions',
    }
  ]

  const categories = ref([
    {
      id: 1,
      weight: 1,
      name: 'Categorie 1'
    },
    {
      id: 2,
      weight: 3,
      name: 'Categorie w3',
    },
    {
      id: 3,
      weight: 2,
      name: 'Categorie w2',
    }
  ])

  function rowClicked(row: object) {
    selectedCategory.value = {...row} // We make a shallow clone
    isVisible.value = true
  }

  function move(row: any, modifier: number) {
    // TODO: Change this for api call (so they are all moved cleanly in bo)
    // row.weight += modifier

    const sortedCategories = categories.value.sort((a, b) => (a.weight > b.weight ? 1 : -1))
    const matchToExchange = sortedCategories.find( value => value.weight == row.weight + modifier )

    if (!matchToExchange) return;

    matchToExchange.weight = row.weight
    row.weight += modifier
  }

</script>

<template>
  <GenericLayoutContentWithStickySide :display-side="isVisible" @keyup.esc="isVisible = false; selectedCategory = null;" tabindex="-1">
    <template #main>
      <UCard>
        <UTable
          class="w-full"
          :sort="sort"
          :columns="columns"
          :rows="categories"
          @select="rowClicked">
          <template #empty-state>
            <div class="flex flex-col items-center justify-center py-6 gap-3">
              <span class="italic text-sm">Aucune catégories.</span>
            </div>
          </template>

          <template #name-data="{ row }">
            {{ row.name }}
          </template>

          <template #actions-data="{ row }">
            <GenericStackedUpDown @changed="modifier => { move(row, -modifier) }" />
          </template>

        </UTable>
      </UCard>
    </template>

    <template #side>
      <template v-if="selectedCategory">
        <UCard class="overflow-y-auto">

          <div class="flex gap-2 flex-col">
            <UFormGroup label="Nom" :error="!selectedCategory.name && 'Champ requis'">
              <UInput v-model="selectedCategory.name" />
            </UFormGroup>
          </div>

        </UCard>

        <UButton block>Enregistrer</UButton>
        <UButton color="red" block>Supprimer</UButton>
      </template>
    </template>
  </GenericLayoutContentWithStickySide>
</template>

<style scoped lang="scss">

</style>
