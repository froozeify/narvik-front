<script setup lang="ts">
import type {MemberPresence} from "~/types/api/item/clubDependent/plugin/presence/memberPresence";
import type {PropType} from "vue";
import type {ExternalPresence} from "~/types/api/item/clubDependent/plugin/presence/externalPresence";
import {usePaginationValues} from "~/composables/api/list";
import {formatDateReadable} from "~/utils/date";

const props = defineProps({
  presences: {
    type: Object as PropType<MemberPresence[]|ExternalPresence[]>,
    required: true
  },
  totalPresences: {
    type: Number,
    required: true
  },

  accentColor: {
    type: String,
    default: 'primary'
  },
  isExternalPresences: {
    type: Boolean,
    default: false
  },
  canSort: {
    type: Boolean,
    default: true
  },
  displayFullDate: {
    type: Boolean,
    default: true
  },
  hasPagination: {
    type: Boolean,
    default: true
  },
  displayNoDataRegister: {
    type: Boolean,
    default: true
  },
  isLoading: {
    type: Boolean,
    default: false
  },
})

const emit = defineEmits([
  'register',
  'rowClicked',
  'sort',
  'paginate'
])

const page = ref(1);
const itemsPerPage = ref(10);
const sort = ref({
  column: 'date',
  direction: 'desc'
});

export interface TableSortInterface {
  column: string,
  direction: string
}

export interface TablePaginateInterface {
  page: number,
  itemsPerPage: number,
  sort: TableSortInterface
}

const columns = [
  {
    accessorKey: 'date',
    header: props.displayFullDate ? 'Date' : 'Heure',
    sortable: props.canSort
  },
  {
    accessorKey: 'licence',
    header: 'Licence',
    meta: {
      class: {
        th: 'w-24',
      }
    }
  }, {
    accessorKey: 'fullName',
    header: 'Nom',
    meta: {
      class: {
        th: 'w-1/4',
      }
    }
  }, {
    accessorKey: 'activities',
    header: 'Activités',
    meta: {
      class: {
        th: 'w-full',
      }
    }
  }
]

function rowClicked(row: MemberPresence|ExternalPresence) {
  console.warn("rowClicled, doest it still work or is it row.original")
  if (!props.isExternalPresences && !row.member) {
    return;
  }
  emit('rowClicked', row)
}

function sortClicked() {
  if (props.canSort) {
    emit('sort', sort.value)
  }
}

function emitPaginate() {
  emit('paginate', { page: page.value, itemsPerPage: itemsPerPage.value, sort: sort.value })
}

</script>

<template>
  <UTable
    :loading="props.isLoading"
    class="w-full"
    v-model:sort="sort"
    sort-mode="manual"
    @update:sort="sortClicked()"
    :columns="columns"
    :data="props.presences"
    @select="rowClicked">
    <template #empty-state>
      <div class="flex flex-col items-center justify-center py-6 gap-3">
        <span class="italic text-sm">Aucune présences enregistrée.</span>
        <UButton v-if="props.displayNoDataRegister" class="mt-4" label="S'enregistrer" @click="emit('register')"/>
      </div>
    </template>

    <template #date-cell="{ row }">
      <template v-if="props.displayFullDate">
        {{ formatDateReadable(row.original.date) }} à {{ formatTimeReadable(row.original.createdAt) }}
      </template>
      <template v-else>
        {{ formatTimeReadable(row.original.createdAt) }}
      </template>
    </template>

    <template #licence-cell="{ row }">
      <template v-if="props.isExternalPresences">
        {{ row.original.licence }}
      </template>
      <template v-else>
        {{ row.original.member?.licence }}
      </template>
    </template>

    <template #fullName-cell="{ row }">
      <template v-if="props.isExternalPresences">
        {{ row.original.fullName }}
      </template>
      <template v-else>
        <div v-if="row.original.member" class="flex flex-wrap gap-2">
          <UBadge v-if="row.original.member.currentSeason && row.original.member.currentSeason.isSecondaryClub"
            variant="subtle"
            color="success"
            :ui="{ rounded: 'rounded-full' }">
            Club secondaire
          </UBadge>

          <p class="inline-flex items-center w-full">{{ row.original.member.fullName }}</p>
        </div>
        <p v-else class="italic">Membre supprimé</p>
      </template>
    </template>

    <template #activities-cell="{ row }">
      <div class="flex flex-1 flex-wrap gap-2">
        <template v-if="!props.isExternalPresences && row.original.member">
          <div v-if="row.original.member.blacklisted" class="basis-full">
            <UButton
              color="neutral"
              :ui="{ rounded: 'rounded-full' }">
              Blacklisté
            </UButton>
          </div>

          <div v-if="!row.original.member.currentSeason" class="basis-full">
            <UButton
                color="error"
                :ui="{ rounded: 'rounded-full' }">
              Saison non renouvelée
            </UButton>
          </div>

          <div v-if="row.original.member.medicalCertificateExpiration && row.original.member.medicalCertificateStatus !== 'valid'" class="basis-full">
            <UButton
              :color="row.original.member.medicalCertificateStatus === 'expired' ? 'error' : 'yellow'"
              :ui="{ rounded: 'rounded-full' }">
              Certificat médical : {{ formatDateReadable(row.original.member.medicalCertificateExpiration.toString()) }}
            </UButton>
          </div>

          <div v-if="new Date((new Date()).setFullYear((new Date().getFullYear() - 1))) > new Date(row.original.member.lastControlShooting)"
               class="basis-full">
            <UButton
                color="error"
                :ui="{ rounded: 'rounded-full' }">
              Dernier contrôle : {{ formatDateReadable(row.original.member.lastControlShooting) }}
            </UButton>
          </div>
        </template>

        <div v-if="row.original.activities.length == 0">
          <i>Aucune activités déclarées</i>
        </div>
        <UButton v-else
          v-for="activity in row.original.activities.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1))"
          :color="props.accentColor"
          :variant="props.isExternalPresences ? 'solid' : 'soft'"
          :ui="{ rounded: 'rounded-full' }">
          {{ activity.name }}
        </UButton>
      </div>
    </template>

  </UTable>

  <div v-if="props.hasPagination" class="flex justify-end gap-4 px-3 py-3.5 border-t border-gray-200 dark:border-gray-700">
    <USelect v-model="itemsPerPage" :items="usePaginationValues" @update:model-value="emitPaginate()" />
    <UPagination v-model="page" @update:model-value="emitPaginate()" :page-count="parseInt(itemsPerPage.toString())" :total="props.totalPresences" />
  </div>
</template>

<style scoped lang="css">

</style>
