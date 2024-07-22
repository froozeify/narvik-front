<script setup lang="ts">
import MemberQuery from "~/composables/api/query/MemberQuery";
import type {Member} from "~/types/api/item/member";

const props = defineProps({
  query: {
    type: [String],
    required: false
  }
});

const emit = defineEmits([
  'selected-member',
])

const toast = useToast()

let inputTimer: NodeJS.Timeout;

const searching = ref(false);
const memberSelected = ref();
const foundMembers: Ref<Member[]> = ref([])
const query: Ref<string|undefined> = ref(undefined)

watch(query, (value) => {
  search(value)
})

if (props.query) {
  query.value = props.query
}

async function search(query: any, replayCount: number = 0) {
  clearTimeout(inputTimer);
  inputTimer = setTimeout(async () => {
    if (query === null || query.trim() === "") {
      searching.value = false;
      foundMembers.value = [];
      return;
    }

    searching.value = true;

    const memberQuery = new MemberQuery();
    const searchResult = await memberQuery.search(query);
    searching.value = false;

    if (searchResult.error) {
      if (searchResult.error.message.includes('The operation was aborted')) {
        // We replay the query
        if (replayCount < 5) {
          toast.add({
            color: "orange",
            title: "Problème réseau",
            description: `Il semblerait que la requête ne peut aboutir. Nouvelle tentative. (${replayCount + 1}/5)`
          })
          return await search(query, ++replayCount);
        } else {
          toast.add({
            color: "red",
            title: "Une erreur est survenue",
            description: "Il semblerait que la requête ne peut aboutir. Veuillez rafraichir la page."
          })
          return;
        }
      }

      toast.add({
        color: "red",
        title: "Une erreur est survenue",
        description: searchResult.error.message
      })

      return;
    }

    if (!searchResult.item) return;

    const members: Ref<Member[]> = ref([])
    members.value = searchResult.item

    foundMembers.value = members.value;
    if (members.value.length === 1) {
      rowClicked(members.value.at(0) as Member)
    }

  }, 800);
}

const columns = [{
  key: 'licence',
  label: 'Licence'
}, {
  key: 'fullName',
  label: 'Nom'
}]

function rowClicked(row: Member) {
  memberSelected.value = row
  emit('selected-member', row)
}

</script>

<template>
  <div class="flex flex-col justify-start px-4 py-4 rounded-lg divide-y divide-gray-200 dark:divide-gray-800 ring-1 ring-gray-200 dark:ring-gray-800 shadow bg-white dark:bg-gray-900 min-h-96">

    <UFormGroup label="Nom / Licence">
      <UInput
          class="mb-4"
          v-model="query"
          :loading="searching"
          placeholder="Nom / Licence"
          trailing
      />
    </UFormGroup>

    <UTable
        :loading="searching"
        class="w-full"
        :columns="columns"
        :rows="foundMembers"
        @select="rowClicked">
      <template #empty-state>
        <div class="flex flex-col items-center justify-center py-6 gap-3">
          <span class="italic text-sm">Aucune résultat trouvé</span>
        </div>
      </template>
    </UTable>

  </div>
</template>

<style scoped lang="scss">

</style>
