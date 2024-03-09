<script setup lang="ts">

import SearchMember from "~/components/Member/SearchMember";
import RegisterMemberPresence from "~/components/PresentMember/RegisterMemberPresence";
import MemberPresenceQuery from "~/composables/api/query/MemberPresenceQuery";
import type {MemberPresence} from "~/types/memberpresence";
import type {Member} from "~/types/member";
import RegisterExternalPresence from "~/components/ExternalPresence/RegisterExternalPresence";
import { useExternalPresenceStore } from "~/stores/useExternalPresence";
import {formatDateReadable, formatTimeReadable} from "~/utils/date";

const memberPresenceQuery = new MemberPresenceQuery();

const externalPresenceStore = useExternalPresenceStore()
const presentMembers: Ref<MemberPresence[] | undefined> = ref(undefined);
const isRefreshing: Ref<boolean> = ref(false)

getPresences()

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
        // pm['class'] = 'bg-red-500/50 dark:bg-red-400/50 animate-pulse';
        // @ts-ignore We add some specific class to warn the user
        pm['expired_shooting'] = new Date(pm.member.lastControlShooting);
      }
    })

    response.presentMembers = presentMembers.value
  }
  return response
});

const memberPresenceModalOpen = ref(false);
const searchMemberModalOpen = ref(false);
const addExternalPresenceModal = ref(false);
const historyModal = ref(false);

const searchQuery = ref('')

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
    class: 'w-1/4'
  }, {
    key: 'activities',
    label: 'Activités'
  }
]

refreshNight()
function refreshNight() {
  var now = new Date();
  var night = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      3, 0, 0
  );
  var msToMidnight = night.getTime() - now.getTime();
  if (msToMidnight > 0) {
    setTimeout(function() {
      getPresences(true);
      refreshNight(); // Then, reset again next night.
    }, msToMidnight);
  }
}

function getPresences(force: boolean = false) {
  isRefreshing.value = true
  if (externalPresenceStore.list === undefined || force) {
    externalPresenceStore.refresh()
  }

  memberPresenceQuery.getPresentToday().then(value => {
    presentMembers.value = value.items
    isRefreshing.value = false
  });
}

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
    searchQuery.value = '';
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
    presentMembers.value = value.items
  });
}

function memberPresenceUpdated(memberPresence?: MemberPresence) {
  if (!memberPresence) memberPresenceModalOpen.value = false

  memberPresenceQuery.getPresentToday().then(value => {
    presentMembers.value = value.items
  });
}

function keyPressHandler(ev: KeyboardEvent) {
  if (
      externalPresenceStore.modalOpen === true ||
      addExternalPresenceModal.value === true ||
      memberPresenceModalOpen.value === true ||
      searchMemberModalOpen.value === true ||
      historyModal.value === true) {
    return;
  }

  openAddPresenceModal()
  searchQuery.value = searchQuery.value + ev.key
}

onMounted(() => {
  externalPresenceStore.modalOpen = false
  window.addEventListener('keypress', keyPressHandler)
})

onUnmounted(() => {
  window.removeEventListener('keypress', keyPressHandler)
  externalPresenceStore.modalOpen = false
})

</script>

<template>
  <div>
    <div class="flex flex-col sm:flex-row gap-4 mb-4">
      <UButton
        icon="i-heroicons-calendar-days"
        variant="ghost"
        @click="historyModal = true"
      />

      <span class="flex-1"></span>

      <UButton variant="soft" color="orange" label="Enregistrement tireur externe" @click="openAddExternalPresenceModal()"/>
      <UButton label="S'enregistrer" @click="openAddPresenceModal()"/>
    </div>

    <div v-if="externalPresenceStore.list && externalPresenceStore.list.length > 0" class="mb-4">
      <ExternalPresenceTodayList />
    </div>

    <UCard>
      <div class="flex px-3 py-3.5 border-b border-gray-200 dark:border-gray-700 items-center">
        <p class="font-bold">Membres enregistrés aujourd'hui : {{ presenceList.presentMembers.length }}</p>


        <div class="flex-1"></div>

        <div class="inline-flex">
          <UTooltip text="Rafraichir">
            <UButton
                icon="i-heroicons-arrow-path"
                color="gray"
                variant="solid"
                aria-label="Rafraichir"
                :loading="isRefreshing"
                @click="getPresences(true)"
            />
          </UTooltip>
        </div>
      </div>
      <UTable
          :loading="presenceList.loading"
          class="w-full"
          :columns="columns"
          :rows="presenceList.presentMembers"
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
          <div class="flex flex-1 flex-wrap gap-4">

            <div v-if="row['expired_shooting']" class="basis-full">
              <UButton
                  color="red"
                  :ui="{ rounded: 'rounded-full' }">
                Dernier tir de contrôle : {{ formatDateReadable(row['expired_shooting']) }}
              </UButton>
            </div>

            <div v-if="row.activities.length == 0">
              <i>Aucune activités déclarées</i>
            </div>

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
        <SearchMember :query="searchQuery" @selected-member="memberSelectedFromSearch" />
      </template>
      <template v-else>
        <RegisterMemberPresence :member="selectedMember" @registered="presenceRegistered" @canceled="searchMemberModalOpen = false;" />
      </template>
    </UModal>

    <UModal
      v-model="historyModal"
      :ui="{
        width: 'lg:max-w-5xl p-4 mx-4'
      }"
    >
      <PresenceList />
    </UModal>

  </div>
</template>

<style scoped lang="scss">

</style>
