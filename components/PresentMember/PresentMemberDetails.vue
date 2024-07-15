<script setup lang="ts">
import type {PropType} from "vue";
import type {MemberPresence} from "~/types/memberpresence";
import clipboard from "clipboardy";
import RegisterMemberPresence from "~/components/PresentMember/RegisterMemberPresence.vue";
import type {Image} from "~/types/image";
import ImageQuery from "~/composables/api/query/ImageQuery";
import MemberQuery from "~/composables/api/query/MemberQuery";
import type {Member} from "~/types/member";
import {formatDateReadable} from "~/utils/date";
import {useSelfMemberStore} from "~/stores/useSelfMember";

import { Chart as ChartJS, Title, Tooltip, Legend, DoughnutController, ArcElement, CategoryScale, LinearScale, Colors } from 'chart.js'
import { Doughnut } from 'vue-chartjs'
import MemberPresenceQuery from "~/composables/api/query/MemberPresenceQuery";
ChartJS.register(Title, Tooltip, Legend, DoughnutController, ArcElement, CategoryScale, LinearScale, Colors)

const toast = useToast()
const selfStore = useSelfMemberStore()
const isAdmin = selfStore.isAdmin()
const isSupervisor = selfStore.hasSupervisorRole()
const isBadger = selfStore.isBadger()

const props = defineProps({
  item: {
    type: Object as PropType<MemberPresence>,
    required: true
  },
  viewOnly: {
    type: Boolean,
    required: false,
    default: false
  }
});

const emit = defineEmits([
  'updated',
])

const imageQuery = new ImageQuery()
const memberQuery = new MemberQuery()
const memberPresenceQuery = new MemberPresenceQuery()

const memberPresence: Ref<MemberPresence> = ref(props.item)
const member: Ref<Member | undefined> = ref(undefined)

const memberProfileImage: Ref<Image|undefined> = ref(undefined)

const isLoadingPresences = ref(false)
const memberPresences: Ref<MemberPresence[]> = ref([])
const totalMemberPresences = computed(() => memberPresences.value.length)

const chartData: Ref<object|undefined> = ref(undefined)
const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
})

const updateMemberPresenceModalOpen = ref(false);

if (memberPresence.value && memberPresence.value.member?.id) {
  // We request the real member datas
  memberQuery.get(memberPresence.value.member.id).then(memberResponse => {
    if (memberResponse.retrieved) {
      member.value = memberResponse.retrieved

      // We load the profile image
      if (memberResponse.retrieved.profileImage) {
        imageQuery.get(memberResponse.retrieved.profileImage).then(profileImage => {
          if (profileImage.retrieved) {
            memberProfileImage.value = profileImage.retrieved
          }
        })
      }
    }
  })
}

function loadPresenceHistory() {
  if (!member.value || !member.value.id) return;

  // We load the member stats
  const presenceUrlParams = new URLSearchParams({
    'order[date]': 'desc',
    'date[after]': new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().slice(0, 10)
  });

  isLoadingPresences.value = true
  memberQuery.presences(member.value.id, presenceUrlParams).then(presencesResponse => {
    isLoadingPresences.value = false
    if (presencesResponse.items.length > 0) {
      memberPresences.value = presencesResponse.items

      // We update the chart
      let data: any = []

      let newChartData = {
        labels: [] as string[],
        datasets: [
          {
            data: [] as string[]
          },
        ],
      }

      presencesResponse.items.forEach(pr => {
        pr.activities?.forEach(actvt => {
          if (data[actvt.name]) {
            data[actvt.name] = data[actvt.name] + 1;
          }  else {
            data[actvt.name] = 1;
          }
        })
      });


      newChartData.labels = Object.keys(data)
      newChartData.datasets[0].data = Object.values(data)
      chartData.value = newChartData
    }
  })
}

function presenceUpdated(newMemberPresence: MemberPresence) {
  updateMemberPresenceModalOpen.value = false;
  memberPresence.value = newMemberPresence
  emit('updated', newMemberPresence)
}

async function deletePresence(close: Function) {
  if (isSupervisor || isBadger) {
    await memberPresenceQuery.delete(memberPresence.value)
    close()
    emit('updated', null)
  }
}

async function copyLicence() {
  if (selfStore.hasSupervisorRole() && props.item.member?.licence) {
    clipboard.write(props.item.member.licence)
    toast.add({
      title: 'Licence copiée',
      color: "green"
    })
  }
}

function fullNameClicked() {
  if (selfStore.hasSupervisorRole() && member.value) {
    navigateTo(`/admin/members/${member.value.id}`)
  }
}

</script>

<template>
  <div>
    <template v-if="member">
      <UCard>
        <div v-if="!viewOnly && (isSupervisor || isBadger)" class="flex justify-end">
          <UTooltip text="Editer la présence">
            <UButton
                @click="updateMemberPresenceModalOpen = true"
                icon="i-heroicons-pencil-square"
                size="xs"
                variant="ghost"
            />
          </UTooltip>
          <UTooltip text="Supprimer la présence">
            <UPopover>
              <UButton
                  icon="i-heroicons-trash"
                  size="xs"
                  color="red"
                  variant="ghost"
              />

              <template #panel="{ close }">
                <div class="p-4 w-56 flex flex-col gap-4">
                  <div class="text-center text-lg font-bold">Êtes-vous certain ?</div>

                  <UButton
                      @click="deletePresence(close);"
                      color="red"
                      class="mx-auto"
                  >
                    Supprimer
                  </UButton>
                </div>
              </template>
            </UPopover>
          </UTooltip>
        </div>

        <div class="mx-auto my-0 h-24 w-24 aspect-square">
          <img class="rounded-full w-full h-full object-contain bg-gray-100 dark:bg-gray-800" v-if="memberProfileImage" :src="memberProfileImage.base64" />
          <USkeleton v-else class="w-full h-full" :ui="{ rounded: 'rounded-full' }"/>
        </div>

        <div class="space-y-4 w-full my-4">
          <div class="text-center text-2xl font-bold" @click="fullNameClicked">
            {{ member.fullName }}
          </div>
          <div class="flex justify-center gap-2">
            <UBadge
                v-if="member.currentSeason && member.currentSeason.ageCategory.code"
                variant="subtle"
                color="amber"
                :ui="{ rounded: 'rounded-full' }">
              {{ member.currentSeason.ageCategory.name }}
            </UBadge>

            <UButton
              v-if="!member.currentSeason"
              color="red"
              :ui="{ rounded: 'rounded-full' }">
              Saison non renouvelée
            </UButton>

            <UBadge v-if="member.currentSeason && member.currentSeason.isSecondaryClub"
                    variant="subtle"
                    color="green"
                    :ui="{ rounded: 'rounded-full' }">
              Club secondaire
            </UBadge>
          </div>
          <div class="flex items-center justify-center text-xl cursor-pointer select-none" @click="copyLicence">
            <UIcon class="mr-2" name="i-heroicons-identification" />
            {{ member.licence }}
          </div>
          <div v-if="member.lastControlShooting" class="text-center text-xl">
            Dernier tir de contrôle : {{ formatDateReadable(member.lastControlShooting) }}
          </div>
          <div class="flex gap-4 justify-center flex-wrap">
            <UButton
                v-for="activity in memberPresence?.activities.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1))"
                variant="soft"
                :ui="{ rounded: 'rounded-full' }"
            >
              {{ activity.name }}
            </UButton>
          </div>

        </div>

        <div class="flex justify-center">
          <UButton
            @click="loadPresenceHistory()"
            :loading="isLoadingPresences"
          >
            Afficher l'historique de présence
          </UButton>
        </div>
      </UCard>

      <UCard
          v-if="totalMemberPresences > 0"
          class="mt-4"
      >
        <div class="text-xl text-center font-bold mb-4">{{ totalMemberPresences }} présences ces 12 derniers mois</div>

        <div class="h-96 mt-4">
          <Doughnut
              :data="chartData"
              :options="chartOptions"
          />
        </div>
      </UCard>

    </template>

    <UCard v-else>
      <div class="flex justify-end">
        <UTooltip text="Editer" class="">
          <UButton
              icon="i-heroicons-pencil-square"
              size="xs"
              variant="ghost"
          />
        </UTooltip>
      </div>

      <div class="mx-auto my-0 h-24 w-24 aspect-square">
        <USkeleton class="w-full h-full" :ui="{ rounded: 'rounded-full' }"/>
      </div>

      <div class="space-y-4 w-full mt-4">
        <div v-for="w in ['w-52 h-8', 'w-36 h-4', 'w-48 h-4']" class="flex justify-center">
          <USkeleton :class="w" />
        </div>
        <div class="flex gap-4 justify-center flex-wrap">
          <USkeleton v-for="i in (Math.floor(Math.random()*6) + 2)" class="w-14 h-4" />
        </div>

      </div>
    </UCard>

    <UModal
        v-model="updateMemberPresenceModalOpen">
      <RegisterMemberPresence
          :member-presence="memberPresence"
          @registered="presenceUpdated"
          @canceled="updateMemberPresenceModalOpen = false"
      />
    </UModal>
  </div>

</template>

<style scoped lang="scss">

</style>
