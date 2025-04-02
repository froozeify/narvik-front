<script setup lang="ts">
import {useSelfUserStore} from "~/stores/useSelfUser";
import ModalDeleteConfirmation from "~/components/Modal/ModalDeleteConfirmation.vue";
import type {Club, WriteClub} from "~/types/api/item/club";
import ClubQuery from "~/composables/api/query/ClubQuery";
import ClubSettingQuery from "~/composables/api/query/clubDependent/ClubSettingQuery";
import ImageQuery from "~/composables/api/query/ImageQuery";
import {formatDateReadable} from "~/utils/date";
import dayjs from "dayjs";
import ModalClubSelectRenewDate from "~/components/Modal/Club/ModalClubSelectRenewDate.vue";
import MemberSeasonSelectModal from "~/components/MemberSeason/MemberSeasonSelectModal.vue";
import {convertUuidToUrlUuid} from "~/utils/resource";
import {usePaginationValues} from "~/composables/api/list";
import UserQuery from "~/composables/api/query/UserQuery";
import type {User} from "~/types/api/item/user";

definePageMeta({
  layout: "super-admin"
})

useHead({
  title: "Détail club"
})

const toast = useToast()
const modal = useModal()
const route = useRoute()

const selfStore = useSelfUserStore()

const itemId = decodeUrlUuid(route.params.id?.toString());

const isLoading = ref(true)
const isUsersLoading = ref(true)
const itemModalOpen = ref(false)

const club: Ref<Club | undefined> = ref(undefined)
const userClubs: Ref<User[]> = ref([])

const clubQuery = new ClubQuery()
const userQuery = new UserQuery()

// Table settings
const page = ref(1);
const itemsPerPage = ref(10);
const totalUsers = ref(0)
const sort = ref({
  column: 'lastname',
  direction: 'asc'
});
const columns = [
  {
    accessorKey: 'accountActivated',
    header: 'Activé',
  },
  {
    accessorKey: 'fullName',
    header: 'Nom',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'actions',
  }
]

async function loadItem() {
  isLoading.value = true
  const { retrieved, error } = await clubQuery.get(itemId)
  isLoading.value = false

  if (!retrieved || error) {
    toast.add({
      color: "red",
      title: "Club non trouvé",
    })

    navigateTo('/super-admin/clubs')
    return
  }

  club.value = retrieved
  await loadClubSettings()
}

async function loadClubSettings() {
  if (!club.value) return

  if (club.value.settings?.uuid) {
    const clubSettingQuery = new ClubSettingQuery()
    clubSettingQuery.clubPath = club.value["@id"] // We define the club path since we are a super admin

    const { retrieved: clubSettings } = await clubSettingQuery.get(club.value.settings.uuid)
    if (clubSettings) {
      club.value.settings = clubSettings

      // We load the club logo
      const image = await loadClubLogo()
      if (image) {
        club.value.settings.logoBase64 = image
      }
    }
  }
}

async function loadClubLogo() {
  if (!club.value?.settings.logo?.publicUrl) return null;
  const imageQuery = new ImageQuery();
  const { retrieved } = await imageQuery.getFromUrl(club.value.settings.logo.publicUrl);

  if (!retrieved || !retrieved.base64) return null

  return retrieved.base64
}

async function deleteClub() {
  if (!club.value) {
    return
  }

  const { error } = await clubQuery.delete(club.value)

  if (error) {
    toast.add({
      color: "red",
      title: "La suppression a échouée",
      description: error.message
    })

    return
  }
  navigateTo('/super-admin/clubs')
}

async function loadClubUsers() {
  isUsersLoading.value = true

  const urlParams = new URLSearchParams({
    page: page.value.toString(),
    itemsPerPage: itemsPerPage.value.toString(),
  });

  urlParams.append(`order[accountActivated]`, 'DESC');
  urlParams.append(`order[${sort.value.column}]`, sort.value.direction);
  urlParams.append(`memberships.member.club.uuid`, itemId);

  const {totalItems, items} = await userQuery.getAll(urlParams)
  userClubs.value = items
  if (totalItems) {
    totalUsers.value = totalItems
  }

  isUsersLoading.value = false
}

// Main code
loadItem()
loadClubUsers()
</script>

<template>
  <div v-if="club" class="flex flex-col gap-4">
    <div class="flex flex-col lg:flex-row gap-2">
      <UButton
        to="/super-admin/clubs"
        icon="i-heroicons-queue-list"
        variant="soft"
        size="xs"
        label="Liste"
      />

      <div class="flex-1 text-center font-bold text-2xl flex justify-center items-center gap-2 ">
        <p>{{ club.name }}</p>
        <UIcon
          :class="club.isActivated ? 'text-success-600' : 'text-error-600'"
          :name="club.isActivated ? 'i-heroicons-check': 'i-heroicons-x-mark'"
        />
      </div>

      <div class="flex justify-between gap-2">
        <UButton
          icon="i-heroicons-pencil"
          color="warning"
          size="xs"
          label="Modifier"
          @click="itemModalOpen = true"
        />

        <UButton
          icon="i-heroicons-trash"
          color="error"
          size="xs"
          label="Supprimer"
          @click="modal.open(ModalDeleteConfirmation, {
            onDelete() {
              modal.close()
              deleteClub()
            }
          })"
        />
      </div>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <UCard class="h-full">
          <div class="flex flex-col gap-4 relative">

            <div class="h-24 w-24 aspect-square self-center">
              <UAvatar
                class="w-full h-full"
                size="3xl"
                :src="club.settings.logoBase64"
                :alt="club.name"
                :ui="{
                    rounded: 'object-contain bg-gray-100 dark:bg-gray-800'
                  }"
              />
            </div>

            <div class="text-center text-2xl font-bold">
              {{ club.name }}
            </div>

            <div v-if="club.renewDate" class="text-center text-lg">
              Renouvellement le
              <UButton icon="i-heroicons-calendar-days-20-solid"
                       :color="dayjs().isAfter(dayjs(club.renewDate).subtract(14, 'days')) ? 'red' : 'primary'"
                       :label="formatDateReadable(club.renewDate?.toString()) || 'Choisir une date'"
                       @click="modal.open(ModalClubSelectRenewDate, {
                  item: club,
                  async onSelected(date: Date|undefined) {
                    if (!club) {
                      return
                    }
                    let payload: WriteClub = { renewDate: date }
                    await clubQuery.patch(club, payload)
                    await loadItem()
                  }
                })"
              />
            </div>

            <div class="flex flex-col justify-center">

              <div v-if="club.contactName" class="flex justify-center items-center">
                <UIcon class="mr-2" name="i-heroicons-user" />
                <UButton variant="link">{{ club.contactName }}</UButton>
              </div>

              <div v-if="club.contactEmail" class="flex justify-center items-center">
                <UIcon class="mr-2" name="i-heroicons-at-symbol" />
                <UButton variant="link" :to="'mailto:' + club.contactEmail">{{ club.contactEmail }}</UButton>
              </div>

              <div v-if="club.contactPhone" class="flex justify-center items-center">
                <UIcon class="mr-2" name="i-heroicons-phone" />
                <UButton variant="link" :to="'tel:' + club.contactPhone">{{ club.contactPhone.match(/.{1,2}/g)?.join(' ') }}</UButton>
              </div>

              <div class="flex justify-center mt-4">
                <UButton color="warning" @click="selfStore.impersonateClub(club)">Impersonifier</UButton>
              </div>

            </div>

          </div>

      </UCard>

      <UCard
        class="flex-1"
        :ui="{
          body: {
            padding: 'h-full'
          }
        }"
      >
        <ClubSubscriptionList :item="club" />
      </UCard>
    </div>
    <div>
      <GenericCard title="Utilisateurs">
        <p>Compte avec un mail de connexion liée.</p>
        <div>
          <UTable
            class="w-full"
            :loading="isUsersLoading"
            :columns="columns"
            :data="userClubs">
            <template #empty-state>
              <div class="flex flex-col items-center justify-center py-6 gap-3">
                <span class="italic text-sm">Aucun utilisateurs.</span>
              </div>
            </template>

            <template #accountActivated-cell="{ row }">
              <USwitch :model-value="row.original.accountActivated" />
            </template>

            <template #actions-cell="{ row }">
              <div class="text-right">
                <UButton variant="soft" :to="`/super-admin/users/${convertUuidToUrlUuid(row.original.uuid)}`">Détails</UButton>
              </div>
            </template>

          </UTable>

          <div class="flex justify-end gap-4 px-3 py-3.5 border-t border-gray-200 dark:border-gray-700">
            <USelect v-model="itemsPerPage" :items="usePaginationValues" @update:model-value="loadClubUsers()"/>
            <UPagination v-model="page" @update:model-value="loadClubUsers()" :page-count="parseInt(itemsPerPage.toString())" :total="totalUsers"/>
          </div>
        </div>
      </GenericCard>
    </div>
  </div>

  <UModal
    v-model="itemModalOpen">
    <template #content>
      <UCard>
        <ClubForm
          :item="club ? {...club} : undefined"
          @updated="(value) => {itemModalOpen = false; loadItem() }"
        />
      </UCard>
    </template>
  </UModal>
</template>

<style scoped lang="css">

</style>
