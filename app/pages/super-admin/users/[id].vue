<script setup lang="ts">
import {useSelfUserStore} from "~/stores/useSelfUser";
import ModalDeleteConfirmation from "~/components/Modal/ModalDeleteConfirmation.vue";
import {type User, UserRole} from "~/types/api/item/user";
import UserQuery from "~/composables/api/query/UserQuery";
import {getAvailableClubRole} from "~/types/api/item/club";
import {convertUuidToUrlUuid} from "~/utils/resource";

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

const itemId = decodeUrlUuid(route.params.id?.toString());

const isLoading = ref(true)
const itemModalOpen = ref(false)

const user: Ref<User | undefined> = ref(undefined)

const userQuery = new UserQuery()

const updatePasswordModalOpen = ref(false)
const passwordState = reactive({
  new: undefined as string|undefined,
  new2: undefined as string|undefined
})

const columns = [
  {
    key: 'displayName',
    label: 'Nom',
    class: 'w-full',
  },
  {
    key: 'club',
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

async function onUpdatePasswordSubmit() {
  if (!user.value) return failedPasswordUpdate();

  if (passwordState.new !== passwordState.new2) {
    return failedPasswordUpdate("Les mot de passe ne correspondent pas")
  }

  const { error } = await userQuery.patch(user.value, {
    plainPassword: passwordState.new
  } as User)
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

      <div class="flex justify-between gap-2 flex-wrap">
        <UButton icon="i-heroicons-lock-closed" @click="updatePasswordModalOpen = true" >
          Changer le mot de passe
        </UButton>

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
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <UCard class="lg:col-span-5 h-full">
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

      <div class="lg:col-span-7">
        <UCard>
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

              <template #club-data="{ row }">
                <ContentLink :to="`/super-admin/clubs/${convertUuidToUrlUuid(row.club.uuid)}`">{{ row.club.name }}</ContentLink>
              </template>

              <template #role-data="{ row }">
                {{ getAvailableClubRole(row.role).text }}
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

  <UModal
    v-if="user"
    v-model="updatePasswordModalOpen">
    <UCard>
      <UForm :state="passwordState" class="space-y-4" @submit="onUpdatePasswordSubmit">
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
</template>

<style scoped lang="scss">

</style>
