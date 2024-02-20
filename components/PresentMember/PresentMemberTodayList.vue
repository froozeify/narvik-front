<script setup lang="ts">

import SearchMember from "~/components/Member/SearchMember";
import RegisterMemberPresence from "~/components/PresentMember/RegisterMemberPresence";
import MemberPresenceQuery from "~/composables/api/query/MemberPresenceQuery";
import type {MemberPresence} from "~/types/memberpresence";
import type {Member} from "~/types/member";
import RegisterExternalPresence from "~/components/ExternalPresence/RegisterExternalPresence";
import { useExternalPresenceStore } from "~/stores/useExternalPresence";
import {formatTimeReadable} from "~/utils/date";

const memberPresenceQuery = new MemberPresenceQuery();

const externalPresenceStore = useExternalPresenceStore()
if (externalPresenceStore.list === undefined) {
  externalPresenceStore.refresh()
}

const presentMembers: Ref<MemberPresence[] | undefined> = ref(undefined);
memberPresenceQuery.getPresentToday().then(value => {
  presentMembers.value = value.items.value
});


const presenceList = computed(() => {
  let response = {
    loading: true,
    presentMembers: Array.of<MemberPresence>()
  }

  if (presentMembers.value) {
    response.loading = false

    presentMembers.value.forEach(pm => {
      // member.lastControlShooting
      const isExpired = new Date((new Date()).setFullYear((new Date().getFullYear() - 1))) > new Date(pm.member.lastControlShooting);
      if (isExpired) {
        // @ts-ignore We add some specific class to warn the user
        pm['class'] = 'bg-red-500/50 dark:bg-red-400/50 animate-pulse';
      }
    })

    response.presentMembers = presentMembers.value
  }
  return response
});

const memberPresenceModalOpen = ref(false);
const searchMemberModalOpen = ref(false);
const addExternalPresenceModal = ref(false);

const selectedMemberPresence: Ref<MemberPresence | null> = ref(null)
const selectedMember: Ref<Member | null> = ref(null)

const columns = [
  {
    key: 'createdAt',
    label: 'Heure',
    class: 'w-20',
    sortable: true
  },
  {
    key: 'member.licence',
    label: 'Licence',
    class: 'w-24'
  }, {
    key: 'member.fullName',
    label: 'Nom',
    class: 'w-1/3'
  }, {
    key: 'activities',
    label: 'Activités'
  }
]

function rowClicked(row: MemberPresence) {
  selectedMemberPresence.value = row;
  memberPresenceModalOpen.value = true;
}

function openAddPresenceModal() {
  searchMemberModalOpen.value = true;
}

function openAddExternalPresenceModal() {
  addExternalPresenceModal.value = true
}

watch(searchMemberModalOpen, (value, oldValue) => {
  if (!value) {
    selectedMember.value = null;
  }
})

function memberSelectedFromSearch(member: Member) {

  // We check the member is not already present, in that case we open up the presence card
  const foundMember = presenceList.value.presentMembers.find( (pm) => pm.member.licence === member.licence);
  if (foundMember) {
    searchMemberModalOpen.value = false;

    selectedMemberPresence.value = foundMember;
    memberPresenceModalOpen.value = true;
    return;
  }

  // Presence not already registered, we display the registerMemberPresence form
  selectedMember.value = member;
}

function presenceRegistered(memberPresence: MemberPresence) {
  searchMemberModalOpen.value = false;
  presentMembers.value = undefined; // We unset the list since we are refreshing it
  memberPresenceQuery.getPresentToday().then(value => {
    presentMembers.value = value.items.value
  });
}

function memberPresenceUpdated(memberPresence: MemberPresence) {
  memberPresenceQuery.getPresentToday().then(value => {
    presentMembers.value = value.items.value
  });
}
</script>

<template>
  <div>
    <div class="flex justify-end gap-4 mb-4">
      <UButton variant="soft" color="orange" label="Enregistrement tireur externe" @click="openAddExternalPresenceModal()"/>
      <UButton label="S'enregistrer" @click="openAddPresenceModal()"/>
    </div>

    <UAccordion v-if="externalPresenceStore.list"
        class="mb-4"
        variant="soft"
        color="orange"
        :items="[
          {
            'label': 'Tireurs externes / non licenciés',
            'slot': 'external-presences'
          }
        ]"
      >

      <template #external-presences>
        <ExternalPresenceTodayList />
      </template>

    </UAccordion>

    <UCard>
      <UTable
          :loading="presenceList.loading"
          class="w-full"
          :columns="columns"
          :rows="presenceList.presentMembers"
          :ui="{
            td: {
              padding: 'py-2'
            }
          }"
          @select="rowClicked">
        <template #empty-state>
          <div class="flex flex-col items-center justify-center py-6 gap-3">
            <span class="italic text-sm">Aucune présence enregistrée</span>
            <UButton class="mt-4" label="S'enregistrer" @click="openAddPresenceModal()"/>
          </div>
        </template>

        <template #createdAt-data="{row}">
          {{ formatTimeReadable(row.createdAt) }}
        </template>

        <template #activities-data="{row}">
          <div v-if="row.activities.length == 0">
            <i>Aucune activités déclarées</i>
          </div>

          <div class="flex flex-1 flex-wrap gap-4">
            <UButton
                v-for="activity in row.activities.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1))"
                variant="soft"
                :ui="{ rounded: 'rounded-full' }">
              {{ activity.name }}
            </UButton>
          </div>
        </template>

      </UTable>

    </UCard>


    <UModal
        v-model="addExternalPresenceModal">
      <RegisterExternalPresence @registered="addExternalPresenceModal = false" @canceled="addExternalPresenceModal = false" />
    </UModal>

    <UModal
        v-model="memberPresenceModalOpen"
        :ui="{
           background: 'bg-transparent dark:bg-transparent',
           shadow: 'shadow-none'
        }"
    >
      <PresentMemberDetails
          :item="selectedMemberPresence"
          @updated="memberPresenceUpdated"
      />
    </UModal>

    <UModal
        v-model="searchMemberModalOpen">
      <template v-if="!selectedMember">
        <SearchMember @selected-member="memberSelectedFromSearch" />
      </template>
      <template v-else>
        <RegisterMemberPresence :member="selectedMember" @registered="presenceRegistered" @canceled="searchMemberModalOpen = false;" />
      </template>
    </UModal>

  </div>
</template>

<style scoped lang="scss">

</style>
