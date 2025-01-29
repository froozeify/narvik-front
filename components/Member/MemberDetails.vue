<script setup lang="ts">
import type {PropType} from "vue";
import {type Member} from "~/types/api/item/clubDependent/member";
import MemberQuery from "~/composables/api/query/clubDependent/MemberQuery";
import type {Image} from "~/types/api/item/image";
import ImageQuery from "~/composables/api/query/ImageQuery";
import type {MemberPresence} from "~/types/api/item/clubDependent/plugin/presence/memberPresence";
import MemberPresenceQuery from "~/composables/api/query/clubDependent/plugin/presence/MemberPresenceQuery";
import {formatDate, formatDateReadable} from "~/utils/date"
import {useSelfUserStore} from "~/stores/useSelfUser";
import RegisterMemberPresence from "~/components/PresentMember/RegisterMemberPresence.vue";
import {usePaginationValues} from "~/composables/api/list";
import ActivityQuery from "~/composables/api/query/clubDependent/plugin/presence/ActivityQuery";
import type {Activity} from "~/types/api/item/clubDependent/plugin/presence/activity";
import type {MemberSeason} from "~/types/api/item/clubDependent/memberSeason";
import UserQuery from "~/composables/api/query/UserQuery";
import {ClubRole, getAvailableClubRoles} from "~/types/api/item/club";

import { ArcElement, CategoryScale, Chart as ChartJS, Colors, DoughnutController, Legend, LinearScale, Title, Tooltip } from 'chart.js'
import {Doughnut} from 'vue-chartjs'
import ModalDeleteConfirmation from "~/components/Modal/ModalDeleteConfirmation.vue";

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
  const modal = useModal()

  const selfStore = useSelfUserStore();

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
  const memberSeasons: Ref<MemberSeason[]> = ref([])

  const isLoadingMemberPresencesPaginated = ref(false)
  const memberPresencesPaginated: Ref<MemberPresence[]> = ref([])
  const totalMemberPresencesPaginated = ref(0)

  const isDownloadingCsv = ref(false)
  const itemModalOpen = ref(false)


  const chartData: Ref<object|undefined> = ref(undefined)
  const chartOptions = ref({
    responsive: true,
    maintainAspectRatio: false,
  })

  // Season table
  const seasonPage = ref(1)
  const seasonItemsPerPage = ref(5);
  const memberSeasonRows = computed(() => {
    return memberSeasons.value.slice((seasonPage.value - 1) * seasonItemsPerPage.value, (seasonPage.value) * seasonItemsPerPage.value)
  })

  // Presences table
  const isUpdating = ref(false);
  const page = ref(1);
  const itemsPerPage = ref(10);
  const sort = ref({
    column: 'date',
    direction: 'desc'
  });

  const memberQuery = new MemberQuery();
  const userQuery = new UserQuery();
  const memberPresenceQuery = new MemberPresenceQuery();
  const imageQuery = new ImageQuery();

  const activityQuery = new ActivityQuery()
  const filteredActivities: Ref<Activity[]> = ref([])
  const activities: Ref<Activity[]> = ref([])
  activityQuery.getAll().then(value => {
    activities.value = value.items.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1))
  });

  watch(filteredActivities, (newValue) => {
    getMemberPresencesPaginated()
  })

  const selectedNewRole: Ref<string | undefined> = ref(undefined);
  const availableRoles = getAvailableClubRoles()

  watch(member, (newValue, oldValue) => {
    if (newValue) {
      if (member.value) {
        if (member.value.profileImage?.privateUrl) {
          imageQuery.getFromUrl(member.value.profileImage.privateUrl).then(imageResponse => {
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
  loadItem()

  function loadItem() {
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

    const { error } = await userQuery.selfUpdatePassword(passwordState.current, passwordState.new)
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

  function changeMemberRole(close: Function) {
    if (!isAdmin || !member.value || !selectedNewRole.value) return;

    memberQuery.updateRole(member.value, selectedNewRole.value as ClubRole).then(({updated, error}) => {
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

      if (member.value && updated) {
        member.value.role = updated.role
      }

      close();
    });
  }

  async function getMemberSeasons() {
    if (!member.value || !member.value.uuid) return;
    const { error, items } = await memberQuery.seasons(member.value.uuid)
    if (error) {
      return
    }
    memberSeasons.value = items
  }

  async function getMemberPresences() {
    if (!member.value || !member.value.uuid) return;

    await getMemberSeasons()

    const presenceUrlParams = new URLSearchParams({
      'order[date]': 'desc',
      'date[after]': new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().slice(0, 10)
    });

    const { totalItems, items } = await memberQuery.presences(member.value.uuid, presenceUrlParams)
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

    await getMemberPresencesPaginated()
  }

  async function getMemberPresencesPaginated() {
    if (!member.value || !member.value.uuid) return;
    isLoadingMemberPresencesPaginated.value = true

    const urlParams = new URLSearchParams({
      pagination: '1',
      page: page.value.toString(),
      itemsPerPage: itemsPerPage.value.toString(),
    });

    urlParams.append(`order[${sort.value.column}]`, sort.value.direction);
    urlParams.append(`order[createdAt]`, sort.value.direction);

    if (filteredActivities.value.length > 0) {
      filteredActivities.value.forEach(filteredActivity => {
        if (!filteredActivity.uuid) return;
        urlParams.append('activities.uuid[]', filteredActivity.uuid)
      })
    }

    // We make the search
    const { totalItems, items } = await memberQuery.presences(member.value.uuid, urlParams)
    memberPresencesPaginated.value = items
    if (totalItems) {
      totalMemberPresencesPaginated.value = totalItems
    }

    isLoadingMemberPresencesPaginated.value = false
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

  async function downloadCsv() {
    if (!member.value || !member.value.uuid) return;
    isDownloadingCsv.value = true

    const urlParams = new URLSearchParams({
      pagination: 'false',
    });

    urlParams.append(`order[${sort.value.column}]`, sort.value.direction);
    urlParams.append(`order[createdAt]`, sort.value.direction);

    if (filteredActivities.value.length > 0) {
      filteredActivities.value.forEach(filteredActivity => {
        if (!filteredActivity.uuid) return;
        urlParams.append('activities.uuid[]', filteredActivity.uuid)
      })
    }

    // We make the search
    const { data } = await memberQuery.presencesCsv(member.value.uuid, urlParams)
    isDownloadingCsv.value = false
    // We download in the browser
    const filename = `${member.value.licence}-presences.csv`
    const blob = new Blob([data], {type: 'text/csv'})
    if(window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveBlob(blob, filename)
    } else {
      const elem = window.document.createElement('a')
      elem.href = window.URL.createObjectURL(blob)
      elem.download = filename
      document.body.appendChild(elem)
      elem.click()
      document.body.removeChild(elem)
    }
  }

</script>

<template>
  <div class="flex flex-row flex-wrap gap-4">
    <div class="flex flex-1 gap-4">
      <UTooltip v-if="isSupervisor" text="Liste des membres" class="">
        <UButton
          to="/admin/members"
          icon="i-heroicons-arrow-left"
          size="xs"
          variant="ghost"
        />
      </UTooltip>

      <!-- Admin && not current account -->
      <template v-if="member && isAdmin && member.email != loggedUsername">
        <UPopover overlay>
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

        <div class="flex-1"></div>

        <UButton
          icon="i-heroicons-pencil-square"
          color="yellow"
          @click="itemModalOpen = true"
        >
          Modifier
        </UButton>

        <UButton
          v-if="member.uuid"
          icon="i-heroicons-trash"
          color="red"
          @click="modal.open(ModalDeleteConfirmation, {
                description: 'Les historiques de présences seront anonymisés et ne pourront être rétablie auprès de ce membre.',
                descriptionColor: 'orange',
                onDelete() {
                  modal.close()
                  // deletePaymentMode()
                }
              })"
        >
          Supprimer
        </UButton>

      </template>

    </div>

    <div class="flex flex-row flex-wrap gap-4">


      <div class="flex-grow">
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

        <UCard v-else class="h-full">
          <div class="flex flex-col gap-4 relative">

            <div class="h-24 w-24 aspect-square self-center">
              <img class="rounded-full w-full h-full object-contain bg-gray-100 dark:bg-gray-800" v-if="memberProfileImage" :src="memberProfileImage.base64" />
              <USkeleton v-else class="w-full h-full" :ui="{ rounded: 'rounded-full' }"/>
            </div>

            <div class="text-center text-2xl font-bold">
              {{ member.fullName }}
            </div>

            <div class="flex flex-col items-center justify-center flex-wrap gap-1">
              <div v-if="member.blacklisted">
                <UButton
                  color="black"
                  :ui="{ rounded: 'rounded-full' }">
                  Blacklisté
                </UButton>
              </div>

              <div v-if="!member.currentSeason">
                <UButton
                  color="red"
                  :ui="{ rounded: 'rounded-full' }">
                  Saison non renouvelée
                </UButton>
              </div>
            </div>

            <div class="grid grid-cols-2">
              <div v-if="member.lastControlShooting" class="col-span-2 flex items-center text-sm">
                Dernier contrôle : {{ formatDateReadable(member.lastControlShooting.toString()) }}
              </div>

              <div class="flex items-center">
                <UIcon class="mr-4" name="i-heroicons-identification" />
                <p class="text-sm">{{ member.licence }}</p>
              </div>

              <div class="flex items-center">
                <UIcon class="mr-2" name="i-heroicons-at-symbol" />
                <UButton variant="link" :to="'mailto:' + member.email">{{ member.email }}</UButton>
              </div>

              <div class="flex items-center">
                <UIcon class="mr-2" name="i-heroicons-phone" />
                <template v-if="member.phone">
                  <UButton variant="link" :to="'tel:' + member.phone">{{ member.phone.match(/.{1,2}/g).join(' ') }}</UButton>
                </template>
                <template v-else>
                  <UButton variant="link" disabled>Non défini</UButton>
                </template>
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

              <UDivider label="Adresse" class="col-span-2 mt-4" />

              <div class="col-span-2 text-sm">
                <p>{{ member.postal1 }}</p>
                <p>{{ member.postal2 }}</p>
                <p>{{ member.postal3 }}</p>
                <p>{{ member.zipCode }} {{ member.city }}</p>
                <p>{{ member.country }}</p>
              </div>

            </div>

          </div>

        </UCard>
      </div>

      <div class="flex basis-1/3">
        <UCard
          class="flex-1"
          :ui="{
            body: {
              padding: 'h-full'
            }
          }"
        >
          <div class="flex flex-col h-full">
            <div v-if="isSupervisor" class="flex gap-4">
              <div class="flex-1"></div>
              <UButton @click="addMemberPresenceModal = true" >
                Ajouter une saison
              </UButton>
            </div>

            <UTable
              class="flex-1"
              :columns="[
            {
              key: 'season.name',
              label: 'Saison',
              class: 'w-full'
            },
            {
              key: 'actions'
            }
          ]"
              :rows="memberSeasonRows"
            >

              <template #empty-state>
                <div class="flex flex-col items-center justify-center py-6 gap-3">
                  <span class="italic text-sm">Aucune saisons enregistrée</span>
                </div>
              </template>

              <template #actions-data="{row}" >
                <div v-if="isSupervisor" class="flex gap-4">
                  <UButton
                    icon="i-heroicons-trash"
                    color="red"
                    @click="modal.open(ModalDeleteConfirmation, {
                      onDelete() {
                        modal.close()
                        // deletePaymentMode()
                      }
                    })"
                  >
                  </UButton>
                </div>
              </template>

            </UTable>

            <div class="flex flex-wrap justify-end gap-4 px-3">
              <UPagination v-model="seasonPage" :page-count="parseInt(seasonItemsPerPage.toString())" :total="memberSeasons.length" />
            </div>

          </div>
        </UCard>
      </div>

      <div class="w-full">
        <UCard v-if="totalMemberPresences > 0">

          <div class="text-xl font-bold">{{ totalMemberPresences }} présences ces 12 derniers mois</div>

          <div class="h-96 mt-4">
            <Doughnut
              :data="chartData"
              :options="chartOptions"
            />
          </div>
        </UCard>
        <UCard v-else>
          <i class="text-lg">Aucune présences ces 12 derniers mois</i>
        </UCard>
      </div>

      <div class="w-full">
        <UCard>
          <div v-if="isSupervisor" class="flex gap-4">
            <USelectMenu
              class="w-44"
              v-model="filteredActivities"
              :options="activities"
              option-attribute="name"
              multiple
            >
              <template #label>
              <span v-if="filteredActivities.length" class="truncate">
                {{ filteredActivities.map(fa => fa.name).join(', ') }}
              </span>
                <span v-else>Activités</span>
              </template>
            </USelectMenu>

            <div class="flex-1"></div>
            <UButton @click="addMemberPresenceModal = true" >
              Ajouter une activité
            </UButton>

            <UButton @click="downloadCsv()" icon="i-heroicons-arrow-down-tray" color="green" :loading="isDownloadingCsv">
              CSV
            </UButton>
          </div>

          <UTable
            :loading="isLoadingMemberPresencesPaginated"
            :columns="[
              {
                key: 'date',
                label: 'Date',
                sortable: true,
              },
              {
                key: 'activities',
                label: 'Activités',
                class: 'w-full'
              },
              {
                key: 'actions'
              }
            ]"
            v-model:sort="sort"
            sort-mode="manual"
            @update:sort="getMemberPresencesPaginated()"
            :rows="memberPresencesPaginated"
          >

            <template #empty-state>
              <div class="flex flex-col items-center justify-center py-6 gap-3">
                <span class="italic text-sm">Aucune présence enregistrée</span>
              </div>
            </template>

            <template #date-data="{row}">
              {{ formatDate(row.date) }} à {{ formatTimeReadable(row.createdAt) }}
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
              <div v-if="isSupervisor" class="flex gap-4">
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

          <div class="flex justify-end gap-4 px-3 py-3.5 border-t border-gray-200 dark:border-gray-700">
            <USelect v-model="itemsPerPage" :options="usePaginationValues" @update:model-value="getMemberPresencesPaginated()" />
            <UPagination v-model="page" @update:model-value="getMemberPresencesPaginated()" :page-count="parseInt(itemsPerPage.toString())" :total="totalMemberPresencesPaginated" />
          </div>
        </UCard>
      </div>

      <UModal
        v-model="itemModalOpen">
        <UCard>
          <MemberForm
            :item="member ? {...member} : undefined"
            @updated="(value) => {itemModalOpen = false; loadItem() }"
          />
        </UCard>
      </UModal>

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
  </div>
</template>

<style scoped lang="scss">

</style>
