<script setup lang="ts">
import ActivityQuery from "~/composables/api/query/clubDependent/plugin/presence/ActivityQuery";
import type {Activity} from "~/types/api/item/clubDependent/plugin/presence/activity";
import type {FormError} from "#ui/types";
import ActivityModalDelete from "~/components/Activity/ActivityModalDelete.vue";
import ActivityModalMigrate from "~/components/Activity/ActivityModalMigrate.vue";
import {ClubRole, getAvailableClubRoles} from "~/types/api/item/club";

definePageMeta({
  layout: "admin"
});

useHead({
  title: 'Gestion des activités'
})

const toast = useToast()
const modal = useModal()

const isLoading = ref(true)
const activities: Ref<Activity[]> = ref([])
const selectedActivity: Ref<Activity | undefined> = ref(undefined)

// Side menu visible
const isVisible = ref(false);
watch(selectedActivity, (value, oldValue) => {
  isVisible.value = value !== undefined
})

const activityQuery = new ActivityQuery();

const availableRoles = getAvailableClubRoles()
const availableRolesSelect = computed( () => {
  const items: SelectItem[] = []
  availableRoles.forEach(value => {
    items.push({
      label: value.text,
      value: value.value
    })
  })
  return items;
})

const columns = [
  {
    key: 'enabled',
    label: 'Disponible'
  },
  {
    key: 'name',
    label: 'Nom',
    class: 'w-full'
  },
  {
    key: 'visibility',
    label: 'Visibilité',
  },
  {
    key: 'actions',
  }
]

async function getActivities() {
  isLoading.value = true

  const urlParams = new URLSearchParams({
    'order[isEnabled]': 'ASC',
    'order[name]': 'ASC',
  });

  const {items} = await activityQuery.getAll(urlParams)
  activities.value = items

  isLoading.value = false
}

function rowClicked(row: Activity) {
  selectedActivity.value = {...row} // We make a shallow clone
  isVisible.value = true
}

const validate = (state: any): FormError[] => {
  const errors = []
  if (!state.name) errors.push({path: 'name', message: 'Champ requis'})
  return errors
}

function createActivity() {
  selectedActivity.value = {
    isEnabled: true,
    name: ''
  }
}

async function updateActivity(activity: Activity) {
  isLoading.value = true

  let payload: Activity = {
    name: activity.name,
    isEnabled: activity.isEnabled,
    visibility: activity.visibility
  }

  // We verify if it's a creation or an update
  let errorApi: Error | undefined = undefined
  if (!activity.uuid) {
    const {error, created} = await activityQuery.post(payload)
    errorApi = error
    selectedActivity.value = created
  } else { // Update
    const {error} = await activityQuery.patch(activity, payload);
    errorApi = error
  }

  isLoading.value = false

  if (errorApi) {
    toast.add({
      color: "red",
      title: !activity.uuid ? "La création a échouée" : "La modification a échouée",
      description: errorApi.message
    });
    return;
  }

  toast.add({
    color: "green",
    title: !activity.uuid ? "Activité créée" : "Activité modifiée",
  });

  await getActivities()
}

async function deleteActivity() {
  if (!selectedActivity.value) return

  isLoading.value = true
  const {error} = await activityQuery.delete(selectedActivity.value);
  isLoading.value = false

  if (error) {
    toast.add({
      color: "red",
      title: "La suppression a échouée",
      description: error.message
    })
    return
  }

  toast.add({
    color: "green",
    title: "Activité supprimée"
  })
  selectedActivity.value = undefined
  await getActivities()
}

async function migrateActivity(migrationTarget: string) {
  if (!selectedActivity.value?.uuid || !migrationTarget) return;

  isLoading.value = true
  const {error} = await activityQuery.mergeTo(selectedActivity.value.uuid, migrationTarget)
  isLoading.value = false
  selectedActivity.value = undefined

  if (error) {
    toast.add({
      color: "red",
      title: "La migration a échouée",
      description: error.message
    })
    return
  }

  toast.add({
    color: "green",
    title: "Activité migrée"
  })
  await getActivities()
}

// We get the data from the api
getActivities()

</script>

<template>
  <GenericLayoutContentWithStickySide @keyup.esc="isVisible = false; selectedActivity = undefined;"
                                      :has-side-content="isVisible" :mobile-side-title="selectedActivity?.name"
                                      tabindex="-1">
    <template #main>
      <UCard>
        <div>
          <div class="flex gap-4">

            <div class="flex-1"></div>
            <UButton @click="createActivity">
              Créer une nouvelle activité
            </UButton>
          </div>

          <UTable
            :loading="isLoading"
            :columns="columns"
            :rows="activities"
            @select="rowClicked">
            <template #empty-state>
              <div class="flex flex-col items-center justify-center py-6 gap-3">
                <span class="italic text-sm">Aucune activité enregistrée</span>
                <UButton class="mt-4" label="Créer" @click="createActivity()"/>
              </div>
            </template>

            <template #enabled-data="{ row }">
              <USwitch :model-value="row.isEnabled" />
            </template>
            <template #visibility-data="{ row }">
              {{ getAvailableClubRoles().find((role) => role.value === row.visibility)?.text ?? 'Par défaut - Membre' }}
            </template>
          </UTable>
        </div>
      </UCard>
    </template>

    <template #side>
      <div class="flex flex-col gap-4" v-if="selectedActivity">
        <UForm :state="selectedActivity" @submit="updateActivity(selectedActivity)" :validate="validate">
          <UCard>
            <div class="flex gap-2 flex-col">
              <UFormField label="Disponible" name="available">
                <USwitch v-model="selectedActivity.isEnabled"/>
              </UFormField>

              <UFormField label="Nom" name="name">
                <UInput v-model="selectedActivity.name"/>
              </UFormField>

              <UFormField label="Visibilité" name="visibility">
                <USelect
                  v-model="selectedActivity.visibility as string"
                  :items="availableRolesSelect"
                  :placeholder="`Par défaut - Membre`" />
              </UFormField>
            </div>

          </UCard>

          <UButton class="mt-4" block type="submit" :loading="isLoading">Enregistrer</UButton>
        </UForm>

        <UButton v-if="selectedActivity.uuid"
          block
          color="red"
          :loading="isLoading"
          @click="modal.open(ActivityModalDelete, {
            title: selectedActivity.name,
            onDelete() {
              modal.close()
              deleteActivity()
            }
          })"
        >
          Supprimer
        </UButton>

        <UButton v-if="selectedActivity.uuid"
                 block
                 color="orange"
                 :loading="isLoading"
                 @click="modal.open(ActivityModalMigrate, {
                 title: selectedActivity.name,
                 activities: activities,
                 onMigrate(targetId: string) {
                   modal.close()
                   migrateActivity(targetId)
                 }
          })"
        >
          Migrer
        </UButton>
      </div>
    </template>
  </GenericLayoutContentWithStickySide>
</template>


<style lang="scss" scoped>

</style>

