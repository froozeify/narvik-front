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
import type {MemberSeason, MemberSeasonWrite} from "~/types/api/item/clubDependent/memberSeason";
import {ClubRole, getAvailableClubRoles} from "~/types/api/item/club";

import { ArcElement, CategoryScale, Chart as ChartJS, Colors, DoughnutController, Legend, LinearScale, Title, Tooltip } from 'chart.js'
import {Doughnut} from 'vue-chartjs'
import ModalDeleteConfirmation from "~/components/Modal/ModalDeleteConfirmation.vue";
import MemberSeasonQuery from "~/composables/api/query/clubDependent/MemberSeasonQuery";
import MemberSeasonSelectModal from "~/components/MemberSeason/MemberSeasonSelectModal.vue";
import MemberEditLinkedEmailModal from "~/components/Member/MemberEditLinkedEmailModal.vue";

ChartJS.register(Title, Tooltip, Legend, DoughnutController, ArcElement, CategoryScale, LinearScale, Colors)


  const props = defineProps({
    member: {
      type: Object as PropType<Member>,
      required: false
    },
    memberId: {
      type: String,
      required: false
    },
    self: {
      type: Boolean,
      default: false
    }
  });

  // Default var setting

  const toast = useToast()
  const modal = useModal()

  const selfStore = useSelfUserStore();

  const loggedUsername = selfStore.member?.email
  const isSuperAdmin = selfStore.isSuperAdmin();
  const isAdmin = selfStore.isAdmin();
  const isSupervisor = selfStore.hasSupervisorRole();

  const addMemberPresenceModal = ref(false)
  const selectedPresence: Ref<MemberPresence | undefined> = ref(undefined)
  const memberPresenceModal: Ref<boolean> = ref(false);

  const member: Ref<Member | undefined> = ref(undefined)
  const memberProfileImage: Ref<Image | undefined> = ref(undefined)
  const memberPresences: Ref<MemberPresence[]> = ref([])
  const totalMemberPresences = computed(() => memberPresences.value.length)

  const isLoadingMemberSeasons = ref(false)
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
  let memberSeasonQuery: MemberSeasonQuery|null = null

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
        memberSeasonQuery = new MemberSeasonQuery(member.value)

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
    isLoadingMemberSeasons.value = true
    const { error, items } = await memberQuery.seasons(member.value.uuid)
    isLoadingMemberSeasons.value = false
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

  async function deleteRow(memberPresence: MemberPresence) {
    isUpdating.value = true

    memberPresenceQuery.delete(memberPresence).then(async ({error}) => {
      if (error) {
        toast.add({
          color: "red",
          title: "La suppression a échouée",
          description: error.message
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

  async function addMemberSeason(seasonIri: string, isSecondary: boolean = false, ageCategory: string|undefined = undefined) {
    if (!memberSeasonQuery || !member.value) {
      return
    }

    const memberSeason: MemberSeasonWrite = {
      member: member.value["@id"],
      season: seasonIri,
      isSecondaryClub: isSecondary
    }

    if (ageCategory) {
      memberSeason.ageCategory = ageCategory
    }

    memberSeasonQuery.post(memberSeason).then(async ({error}) => {
      if (error) {
        toast.add({
          color: "red",
          title: "L'ajout a échoué",
          description: error.message
        })
        return;
      }

      loadItem()

      toast.add({
        color: "green",
        title: "Saison ajoutée"
      })
    })
  }

  async function deleteMemberSeason(memberSeason: MemberSeason) {
    if (!memberSeasonQuery) {
      return
    }

    memberSeasonQuery.delete(memberSeason).then(async ({error}) => {
      if (error) {
        toast.add({
          color: "red",
          title: "La suppression a échouée",
          description: error.message
        })
        return;
      }

      await getMemberSeasons()

      toast.add({
        color: "green",
        title: "Saison supprimée"
      })
    })
  }

  async function deleteMember() {
    if (!member.value) return

    const { error } = await memberQuery.delete(member.value)

    if (error) {
      toast.add({
        color: "red",
        title: "La suppression a échouée",
        description: error.message
      })
      isUpdating.value = false
      return;
    }

    toast.add({
      color: "green",
      title: "Membre supprimé"
    })
    navigateTo('/admin/members')
  }
</script>

<template>
  <div class="flex flex-col lg:flex-row lg:flex-wrap gap-4">
    <div class="flex-1 flex flex-col lg:flex-row gap-2">
      <UTooltip v-if="isSupervisor" text="Liste des membres" class="">
        <UButton
          to="/admin/members"
          icon="i-heroicons-arrow-left"
          size="xs"
          variant="ghost"
        />
      </UTooltip>

      <!-- Admin && not current account -->
      <template v-if="member">
        <UPopover overlay v-if="isSuperAdmin || (isAdmin && member.email != loggedUsername)">
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

        <div>
          <UButton
            v-if="isAdmin"
            icon="i-heroicons-pencil-square"
            color="orange"
            @click="modal.open(MemberEditLinkedEmailModal, {
              member: member,
              onUpdated() {
                loadItem()
              }
            })"
          >
            <template v-if="member.linkedEmail">
              Changer le compte lié
            </template>
            <template v-else>
              Lier à un compte existant
            </template>
          </UButton>
        </div>

        <div class="flex justify-between lg:justify-end gap-2">
          <UButton
            v-if="isAdmin"
            icon="i-heroicons-pencil-square"
            color="yellow"
            @click="itemModalOpen = true"
          >
            Modifier
          </UButton>

          <UButton
            v-if="member.uuid && (isSuperAdmin || (isAdmin && member.email != loggedUsername))"
            icon="i-heroicons-trash"
            color="red"
            @click="modal.open(ModalDeleteConfirmation, {
                alertDescription: 'Les historiques de présences seront anonymisés et ne pourront être rétablie auprès de ce membre.',
                alertColor: 'orange',
                onDelete() {
                  deleteMember()
                  modal.close()
                }
              })"
          >
            Supprimer
          </UButton>
        </div>
      </template>

    </div>
    <div class="grid grid-cols-1 lg:grid-cols-9 gap-4 w-full">

      <div class="lg:col-span-5">
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
              <UAvatar
                class="w-full h-full"
                size="3xl"
                :src="memberProfileImage?.base64"
                :alt="member.fullName"
                :ui="{
                  rounded: 'object-contain bg-gray-100 dark:bg-gray-800'
                }"
              />
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

              <div v-if="member.medicalCertificateExpiration && member.medicalCertificateStatus !== 'valid'">
                <UButton
                  :color="member.medicalCertificateStatus === 'expired' ? 'red' : 'yellow'"
                  :ui="{ rounded: 'rounded-full' }">
                  Certificat médical : {{ formatDateReadable(member.medicalCertificateExpiration.toString()) }}
                </UButton>
              </div>
            </div>

            <div class="grid grid-cols-1 xl:grid-cols-2 text-sm gap-2">
              <div v-if="member.lastControlShooting" class="xl:col-span-2 flex items-center">
                Dernier contrôle : {{ formatDateReadable(member.lastControlShooting.toString()) }}
              </div>

              <MemberDetailsPersonnalInfo icon="i-heroicons-identification" :label="member.licence" />
              <MemberDetailsPersonnalInfo icon="i-heroicons-at-symbol" :label="member.email" :to="'mailto:' + member.email" />
              <MemberDetailsPersonnalInfo icon="i-heroicons-phone" :label="member.phone?.match(/.{1,2}/g)?.join(' ')" :to="member.phone ? 'tel:' + member.phone : undefined" />
              <MemberDetailsPersonnalInfo icon="i-heroicons-phone" :label="member.mobilePhone?.match(/.{1,2}/g)?.join(' ')" :to="member.mobilePhone ? 'tel:' + member.mobilePhone : undefined" />

              <UDivider label="Adresse" class="xl:col-span-2" />

              <div class="xl:col-span-2">
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

      <div class="lg:col-span-4">
        <UCard>
          <div class="flex flex-col h-full">
            <div v-if="isSupervisor" class="flex gap-4">
              <div class="flex-1"></div>
              <UButton
                @click="modal.open(MemberSeasonSelectModal, {
                  onSelected(seasonIri: String, isSecondary: boolean, ageCategory: string|undefined) {
                    addMemberSeason(seasonIri, isSecondary, ageCategory)
                  }
                })"
              >
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
                  key: 'isSecondaryClub',
                  label: 'Club secondaire',
                },
                {
                  key: 'ageCategory.name',
                  label: 'Catégorie'
                },
                {
                  key: 'actions'
                }
              ]"
              :loading="isLoadingMemberSeasons"
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
                      alertTitle: `Suppression de la saison ${row.season.name} pour ${member?.fullName}`,
                      alertColor: 'orange',
                      onDelete() {
                        modal.close()
                        deleteMemberSeason(row)
                      }
                    })"
                  >
                  </UButton>
                </div>
              </template>

              <template #isSecondaryClub-data="{ row }">
                <UToggle :model-value="row.isSecondaryClub" />
              </template>
            </UTable>

            <div class="flex flex-wrap justify-end gap-4 px-3">
              <UPagination v-model="seasonPage" :page-count="parseInt(seasonItemsPerPage.toString())" :total="memberSeasons.length" />
            </div>

          </div>
        </UCard>
      </div>

      <div class="lg:col-span-9">
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

      <div class="lg:col-span-9">
        <UCard>
          <div class="flex flex-col">
            <div v-if="isSupervisor" class="flex flex-col-reverse lg:flex-row gap-4">
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

                  <UButton
                    color="red"
                    label="Supprimer"
                    @click="modal.open(ModalDeleteConfirmation, {
                    title: `Présence du ${formatDateReadable(row.date)}`,
                    alertTitle: 'La suppression de la présence sera définitive.',
                    alertColor: 'orange',
                    onDelete() {
                      modal.close()
                      deleteRow(row)
                    }
                  })"
                  />
                </div>
              </template>

            </UTable>

            <div class="flex justify-end gap-4 px-3 py-3.5 border-t border-gray-200 dark:border-gray-700">
              <USelect v-model="itemsPerPage" :options="usePaginationValues" @update:model-value="getMemberPresencesPaginated()" />
              <UPagination v-model="page" @update:model-value="getMemberPresencesPaginated()" :page-count="parseInt(itemsPerPage.toString())" :total="totalMemberPresencesPaginated" />
            </div>
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
