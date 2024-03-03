<script setup lang="ts">
  import type {PropType} from "vue";
  import {getAvailableMemberRoles, type Member, MemberRole} from "~/types/member";
  import MemberQuery from "~/composables/api/query/MemberQuery";
  import type {Image} from "~/types/image";
  import ImageQuery from "~/composables/api/query/ImageQuery";
  import type {MemberPresence} from "~/types/memberpresence";
  import MemberPresenceQuery from "~/composables/api/query/MemberPresenceQuery";
  import { formatDateTime, formatDateReadable } from "~/utils/date"
  import {useSelfMemberStore} from "~/stores/useSelfMember";

  import { Chart as ChartJS, Title, Tooltip, Legend, DoughnutController, ArcElement, CategoryScale, LinearScale, Colors } from 'chart.js'
  import { Doughnut } from 'vue-chartjs'
  import RegisterMemberPresence from "~/components/PresentMember/RegisterMemberPresence.vue";
  import type {ExternalPresence} from "~/types/externalpresence";
  ChartJS.register(Title, Tooltip, Legend, DoughnutController, ArcElement, CategoryScale, LinearScale, Colors)


  const props = defineProps({
    member: {
      type: Object as PropType<Member>,
      required: false
    },
    memberId: {
      type: String,
      required: false
    }
  });

  // Default var setting

  const toast = useToast()
  const selfStore = useSelfMemberStore();

  const loggedUsername = selfStore.member?.email
  const isAdmin = selfStore.isAdmin();
  const isSupervisor = selfStore.hasSupervisorRole();

  const addMemberPresenceModal = ref(false)
  const selectedPresence: Ref<MemberPresence | undefined> = ref(undefined)
  const memberPresenceModal: Ref<boolean> = ref(false);
  const updatePasswordModalOpen = ref(false)

  const passwordState = reactive({
    current: undefined as string|undefined,
    new: undefined as string|undefined,
    new2: undefined as string|undefined
  })

  const member: Ref<Member | undefined> = ref(undefined)
  const memberProfileImage: Ref<Image | undefined> = ref(undefined)
  const memberPresences: Ref<MemberPresence[]> = ref([])
  const totalMemberPresences = computed(() => memberPresences.value.length)

  const chartData: Ref<object|undefined> = ref(undefined)
  const chartOptions = ref({
    responsive: true,
    maintainAspectRatio: false,
  })

  const isUpdating = ref(false);

  const memberQuery = new MemberQuery();
  const memberPresenceQuery = new MemberPresenceQuery();
  const imageQuery = new ImageQuery();

  const selectedNewRole: Ref<string | undefined> = ref(undefined);
  const availableRoles = getAvailableMemberRoles()

  watch(member, (newValue, oldValue) => {
    if (newValue) {
      if (member.value) {
        if (member.value.profileImage) {
          imageQuery.get(member.value.profileImage).then(imageResponse => {
            memberProfileImage.value = imageResponse.retrieved
          })
        }

        selectedNewRole.value = member.value.role

        // We get the presences
        getMemberPresences()
      }
    }
  })

  // Main logic
  if (props.member) {
    member.value = props.member
  } else {
    if (!props.memberId) {
      throw new Error("memberId prop should be defined")
    }

    memberQuery.get(props.memberId).then(value => {
      if (value.error) {
        toast.add({
          color: "red",
          title: "Une erreur s'est produite",
          description: value.error.message || value.error.toString()
        })

        navigateTo('/admin/members')
        return;
      }

      if (value.retrieved) {
        member.value = value.retrieved
      }
    });
  }

  async function onUpdatePasswordSubmit() {
    if (!member.value) return failedPasswordUpdate();

    if ((!isAdmin && (!passwordState.new || passwordState.new.length < 8)) || passwordState.new !== passwordState.new2) {
      return failedPasswordUpdate("Les mot de passe ne correspondent pas / trop court")
    }

    // Admin editing a user password
    if (member.value.email != loggedUsername) {
      if (!isAdmin) return failedPasswordUpdate("Seul un administrateur peut modifier un mot de passe.");

      let payload: Member = {
        plainPassword: passwordState.new
      }

      const { updated, error } = await memberQuery.patch(member.value, payload)
      if (error) {
        toast.add({
          color: "red",
          title: "Une erreur est arrivé lors de la mise à jour du mot de passe",
          description: error.message
        })
        return;
      }

      toast.add({
        color: "green",
        title: "Mot de passe modifié"
      })
      member.value = updated
      updatePasswordModalOpen.value = false
    }

    if (!passwordState.current) {
      return failedPasswordUpdate("Mot de passe actuel non défini")
    }

    const { error } = await memberQuery.selfUpdatePassword(passwordState.current, passwordState.new)
    if (error) {
      return failedPasswordUpdate(error.message)
    }

    updatePasswordModalOpen.value = false
    toast.add({
      color: "green",
      title: "Mot de passe modifié"
    })
  }

  function failedPasswordUpdate(explanation?: string) {
    toast.add({
      color: "red",
      title: "La modification du mot de passe a échoué",
      description: explanation
    })
  }

  function activateMemberAccount(activated: boolean, close: Function) {
    if (!isAdmin || !member.value) return;

    let payload: Member = {
      accountActivated: activated
    }
    memberQuery.patch(member.value, payload).then(({updated, error}) => {
      if (error) {
        toast.add({
          color: "red",
          title: activated ? "L'activation a échoué" : "La désactivation a échoué",
          description: error.message
        })
        return;
      }

      toast.add({
        color: "green",
        title: activated ? "Compte activé" : "Compté désactivé"
      })
      member.value = updated
      close();
    });

  }

  function changeMemberRole(close: Function) {
    if (!isAdmin || !member.value) return;

    let payload: Member = {
      role: selectedNewRole.value
    }
    memberQuery.patch(member.value, payload).then(({updated, error}) => {
      if (error) {
        toast.add({
          color: "red",
          title: "Une erreur est survenue",
          description: error.message
        })
        return;
      }

      toast.add({
        color: "green",
        title: "Rôle modifié"
      })
      member.value = updated
      close();
    });
  }

  async function getMemberPresences() {
    if (!member.value || !member.value.id) return;

    const presenceUrlParams = new URLSearchParams({
      'order[date]': 'desc',
      'date[after]': new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().slice(0, 10)
    });

    const { totalItems, items } = await memberQuery.presences(member.value.id, presenceUrlParams)
    if (totalItems && totalItems > 0) {
      memberPresences.value = items

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

      items.forEach(pr => {
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

  }

  async function deleteRow(memberPresence: MemberPresence, close: Function) {
    isUpdating.value = true

    memberPresenceQuery.delete(memberPresence).then(async ({error}) => {
      if (error) {
        toast.add({
          color: "red",
          title: "La suppression a échouée",
          description: error
        })
        isUpdating.value = false
        return;
      }

      // We remove the presence from the array
      await getMemberPresences();

      toast.add({
        color: "green",
        title: "Présence supprimée"
      })

      close();
      isUpdating.value = false
    })
  }

  function presenceUpdated(presence?: MemberPresence) {
    memberPresenceModal.value = false
    getMemberPresences()
  }

</script>

<template>
  <div>
    <UCard v-if="!member">
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

    <UCard v-else>

      <div class="flex flex-col gap-4 relative">
        <div class="flex gap-4">
          <UTooltip v-if="isSupervisor" text="Liste des membres" class="">
            <UButton
                @click="navigateTo('/admin/members')"
                icon="i-heroicons-arrow-left"
                size="xs"
                variant="ghost"
            />
          </UTooltip>

          <UButton v-if="member.accountActivated"
            @click="updatePasswordModalOpen = true"
          >
            Changer le mot de passe
          </UButton>
          <!-- Admin && not current account -->
          <template v-if="isAdmin && member.email != loggedUsername">
            <UPopover v-if="member.accountActivated" overlay>
              <UButton color="violet">
                Modifier les permissions
              </UButton>

              <template #panel="{ close }">
                <div class="p-4 w-56 flex flex-col gap-4">
                  <div class="text-center text-lg font-bold">Nouveau rôle souhaité</div>

                  <USelect
                      v-model="selectedNewRole"
                      :options="availableRoles"
                      option-attribute="text"
                      value-attribute="value"
                      placeholder="Aucun rôle de défini" />

                  <UButton
                      @click="changeMemberRole(close)"
                      color="purple"
                      class="mx-auto"
                  >
                    Modifier
                  </UButton>
                </div>
              </template>

            </UPopover>

            <UPopover overlay>
              <UButton color="yellow">
                {{ !member.accountActivated ? 'Activer' : 'Désactiver' }} le compte
              </UButton>

              <template #panel="{ close }">
                <div class="p-4 w-56 flex flex-col gap-4">
                  <div class="text-center text-lg font-bold">Êtes-vous certain ?</div>

                  <UButton
                           @click="activateMemberAccount(!member.accountActivated, close)"
                           color="yellow"
                           class="mx-auto"
                  >
                    {{ !member.accountActivated ? 'Activer' : 'Désactiver' }}
                  </UButton>
                </div>
              </template>

            </UPopover>
          </template>

        </div>

        <div class="h-24 w-24 aspect-square self-center">
          <img class="rounded-full w-full h-full object-contain bg-gray-100 dark:bg-gray-800" v-if="memberProfileImage" :src="memberProfileImage.base64" />
          <USkeleton v-else class="w-full h-full" :ui="{ rounded: 'rounded-full' }"/>
        </div>

        <div class="grid grid-cols-2">
          <div class="flex items-center">
            {{ member.lastname }} {{ member.firstname }}
          </div>

          <div class="flex items-center">
            <UIcon class="mr-2" name="i-heroicons-phone" />
            <template v-if="member.mobilePhone">
              <UButton variant="link" :to="'tel:' + member.mobilePhone">{{ member.mobilePhone.match(/.{1,2}/g).join(' ') }}</UButton>
            </template>
            <template v-else>
              <UButton variant="link" disabled>Non défini</UButton>
            </template>
          </div>

          <div class="flex items-center">
            <UIcon class="mr-2" name="i-heroicons-identification" />
            <p>{{ member.licence }}</p>
          </div>

          <div class="flex items-center">
            <UIcon class="mr-2" name="i-heroicons-at-symbol" />
            <UButton variant="link" :to="'mailto:' + member.email">{{ member.email }}</UButton>
          </div>

          <div>
            Dernier tir de contrôle : {{ formatDateReadable(member.lastControlShooting) }}
          </div>

        </div>

      </div>

    </UCard>

    <div class="mt-4">
      <UCard v-if="totalMemberPresences > 0">

        <div class="text-lg">{{ totalMemberPresences }} présences ces 12 derniers mois</div>

        <div class="h-96 mt-4">
          <Doughnut
              :data="chartData"
              :options="chartOptions"
          />
        </div>

        <div v-if="isSupervisor" class="flex gap-4">
          <div class="flex-1"></div>
          <UButton @click="addMemberPresenceModal = true" >
            Ajouter une activité
          </UButton>
        </div>

        <UTable
            class="mt-4"
            :columns="[
            {
              key: 'date',
              label: 'Date',
              sortable: true,
            },
            {
              key: 'activities',
              label: 'Activités'
            },
            {
              key: 'actions'
            }
          ]"
            :rows="memberPresences"
        >

          <template #empty-state>
            <div class="flex flex-col items-center justify-center py-6 gap-3">
              <span class="italic text-sm">Aucune présence enregistrée</span>
            </div>
          </template>

          <template #date-data="{row}">
            {{ formatDateTime(row.date) }}
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

          <template #actions-data="{row}" >
            <div v-if="isSupervisor" class="w-96 flex gap-4">
              <UButton label="Modifier" @click="selectedPresence = row; memberPresenceModal = true;" />

              <UPopover overlay>
                <UButton color="red" label="Supprimer" />

                <template #panel="{ close }">
                  <div class="p-4 w-[42rem] flex flex-col">
                    <div class="text-center text-lg font-bold">Présence du {{ formatDateReadable(row.date) }}</div>
                    <UAlert
                        class="my-4"
                        color="orange"
                        variant="soft"
                        title="La suppression de la présence sera définitive."
                    />
                    <UButton class="mx-auto" color="red" label="Valider la suppression" :disabled="isUpdating" @click="deleteRow(row, close);" />
                  </div>
                </template>
              </UPopover>
            </div>
          </template>

        </UTable>
      </UCard>
      <UCard v-else>
        <i class="text-lg">Aucune présences ces 12 derniers mois</i>
      </UCard>
    </div>

    <UModal
        v-model="updatePasswordModalOpen">
      <UCard>
        <UForm :state="passwordState" class="space-y-4" @submit="onUpdatePasswordSubmit">

          <UFormGroup v-if="member.email == loggedUsername" label="Mot de passe actuel" name="password">
            <UInput v-model="passwordState.current" type="password" required />
          </UFormGroup>

          <UFormGroup label="Nouveau mot de passe" name="password">
            <UInput v-model="passwordState.new" type="password" required />
          </UFormGroup>

          <UFormGroup label="Confirmation nouveau mot de passe" name="password">
            <UInput v-model="passwordState.new2" type="password" required />
          </UFormGroup>

          <UButton type="submit">
            Changer le mot de passe
          </UButton>
        </UForm>
      </UCard>
    </UModal>

    <UModal v-model="addMemberPresenceModal">
      <RegisterMemberPresence
        :member="member"
        :date-editable="true"
        @canceled="addMemberPresenceModal = false"
        @registered="addMemberPresenceModal = false; getMemberPresences()"
      />
    </UModal>

    <UModal
        v-model="memberPresenceModal">
      <RegisterMemberPresence
          :member-presence="selectedPresence"
          :date-editable="true"
          @canceled="memberPresenceModal = false"
          @registered="presenceUpdated"
      />
    </UModal>

  </div>
</template>

<style scoped lang="scss">

</style>
