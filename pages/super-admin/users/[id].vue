<script setup lang="ts">
import {formatMonetary} from "~/utils/string";
import type {Sale} from "~/types/api/item/clubDependent/plugin/sale/sale";
import SaleQuery from "~/composables/api/query/clubDependent/plugin/sale/SaleQuery";
import {formatDateReadable, formatDateTimeReadable} from "~/utils/date";
import {useSelfUserStore} from "~/stores/useSelfUser";
import dayjs from "dayjs";
import ModalDeleteConfirmation from "~/components/Modal/ModalDeleteConfirmation.vue";
import SaleModalEdit from "~/components/Sale/SaleModalEdit.vue";
import {useSaleStore} from "~/stores/useSaleStore";
import {convertUuidToUrlUuid, decodeUrlUuid} from "~/utils/resource";
import {type User, UserRole} from "~/types/api/item/user";
import UserQuery from "~/composables/api/query/UserQuery";
import MemberSeasonSelectModal from "~/components/MemberSeason/MemberSeasonSelectModal.vue";

definePageMeta({
    layout: "super-admin"
  })

  useHead({
    title: "Détail utilisateur"
  })


  const toast = useToast()
  const modal = useModal()
  const route = useRoute()

  const selfStore = useSelfUserStore()

  const itemId = decodeUrlUuid(route.params.id.toString());

  const isLoading = ref(true)
  const itemModalOpen = ref(false)

  const user: Ref<User | undefined> = ref(undefined)

  const userQuery = new UserQuery()

  const columns = [
    {
      key: 'displayName',
      label: 'Nom',
      class: 'w-full',
    },
    {
      key: 'club.name',
      label: 'Club'
    },
    {
      key: 'role',
      label: 'Rôle'
    }
  ]

  async function loadUser() {
    isLoading.value = true
    const { retrieved, error } = await userQuery.get(itemId)
    isLoading.value = false

    if (!retrieved || error) {
      toast.add({
        color: "red",
        title: "Utilisateur non trouvé",
      })

      navigateTo('/super-admin/users')
      return
    }

    user.value = retrieved
  }

  async function deleteUser() {
    if (!user.value) {
      return
    }

    const { error } = await userQuery.delete(user.value)

    if (error) {
      toast.add({
        color: "red",
        title: "La suppression a échouée",
        description: error.message
      })

      return
    }
    navigateTo('/super-admin/users')
  }

  // Main code
  loadUser()
</script>

<template>
  <div v-if="user" class="flex flex-col gap-4">
    <div class="flex flex-col lg:flex-row gap-2">
      <UButton
        to="/super-admin/users"
        icon="i-heroicons-queue-list"
        variant="soft"
        size="xs"
        label="Liste"
      />

      <div class="flex-1 text-center font-bold text-2xl flex justify-center items-center gap-2 ">
        <p>{{ user.fullName }}</p>
        <UIcon
          :class="user.accountActivated ? 'text-green-600' : 'text-red-600'"
          :name="user.accountActivated ? 'i-heroicons-check': 'i-heroicons-x-mark'"
        />
      </div>

      <div class="flex justify-between gap-2">
        <UButton
          icon="i-heroicons-pencil"
          color="yellow"
          size="xs"
          label="Modifier"
          @click="itemModalOpen = true"
        />

        <UButton
          v-if="user.role !== UserRole.SuperAdmin"
          icon="i-heroicons-trash"
          color="red"
          size="xs"
          label="Supprimer"
          @click="modal.open(ModalDeleteConfirmation, {
            onDelete() {
              modal.close()
              deleteUser()
            }
          })"
        />
      </div>
    </div>
    <div class="flex flex-col lg:flex-row lg:flex-wrap gap-4">
      <div class="flex-1">
        <UCard class="h-full">
          <div class="flex flex-col gap-4 relative">

            <div class="h-24 w-24 aspect-square self-center">
              <UAvatar
                class="w-full h-full"
                size="3xl"
                :alt="user.fullName"
                :ui="{
                    rounded: 'object-contain bg-gray-100 dark:bg-gray-800'
                  }"
              />
            </div>

            <div class="text-center text-2xl font-bold">
              {{ user.fullName }}
            </div>

            <div class="flex flex-col justify-center">

              <div class="flex justify-center items-center">
                <UIcon class="mr-2" name="i-heroicons-at-symbol" />
                <UButton variant="link" :to="'mailto:' + user.email">{{ user.email }}</UButton>
              </div>

              <div class="flex justify-center mt-4">
                <UButton color="yellow" @click="selfStore.impersonateUser(user)">Impersonifier</UButton>
              </div>

            </div>

          </div>

      </UCard>
      </div>

      <div class="flex basis-full lg:basis-1/2">
        <UCard
          class="flex-1"
          :ui="{
            body: {
              padding: 'h-full'
            }
          }"
        >
          <div class="flex flex-col h-full">
            <UTable
              class="flex-1"
              :columns="columns"
              :rows="user.linkedProfiles"
            >
              <template #empty-state>
                <div class="flex flex-col items-center justify-center py-6 gap-3">
                  <span class="italic text-sm">Aucun profil</span>
                </div>
              </template>
            </UTable>
          </div>
        </UCard>
      </div>
    </div>
  </div>

  <UModal
    v-model="itemModalOpen">
    <UCard>
      <UserForm
        :item="user ? {...user} : undefined"
        @updated="(value) => {itemModalOpen = false; loadUser() }"
      />
    </UCard>
  </UModal>
</template>

<style scoped lang="scss">

</style>
