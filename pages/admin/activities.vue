<script setup lang="ts">
import ActivityQuery from "~/composables/api/query/ActivityQuery";
import type {Activity} from "~/types/activity";

definePageMeta({
  layout: "admin"
});

useHead({
  title: 'Gestion des activités'
})

const isLoading = ref(true);
const activities: Ref<DataItem[]> = ref([]);
const migrationTarget: Ref<string|undefined> = ref(undefined);
const toast = useToast();

interface DataItem {
  activity: Activity;
  unsaved: boolean;
  isUpdating: boolean;
}

const activityQuery = new ActivityQuery();

activityQuery.getAll().then(value => {
  isLoading.value = false

  value.items.forEach(actvt => {
    activities.value.push({
      activity: actvt,
      unsaved: false,
      isUpdating: false,
    })
  })
  refreshActivityListOrder();
});

const columns = [{
  key: 'activity.name',
  label: 'Nom'
}, {
  key: 'activity.isEnabled',
  label: 'Disponible'
}, {
  key: 'actions'
}]

function refreshActivityListOrder() {
  activities.value
      .sort((a, b) => (a.activity.name.toLowerCase() > b.activity.name.toLowerCase() ? 1 : -1))
      .sort((a, b) => (a.activity.isEnabled < b.activity.isEnabled ? 1 : -1))
}


function addActivity() {
  const activity: Activity = {
    name: "0. Nouvelle activité",
    isEnabled: true
  }

  isLoading.value = true;
  activityQuery.post(activity).then(({created, violations}) => {
    isLoading.value = false;
    if (created) {
      activities.value.push({
        activity: created,
        unsaved: false,
        isUpdating: false,
      })
      refreshActivityListOrder()
    } else {
      toast.add({
        color: "red",
        title: "L'enregistrement a échoué",
        description: violations._error
      })
    }
  })
}

function updateText(event: any, dataItem: DataItem) {
  dataItem.activity.name = event.target.value;
  dataItem.unsaved = true
}

function toggleClicked(dataItem: DataItem) {
  dataItem.activity.isEnabled = !dataItem.activity.isEnabled
  dataItem.unsaved = true
}

function saveRow(dataItem: DataItem) {
  let payload: Activity = {
    name: dataItem.activity.name,
    isEnabled: dataItem.activity.isEnabled
  }

  activityQuery.patch(dataItem.activity, payload).then(({updated, violations}) => {
    if (updated) {
      dataItem.unsaved = false;
      toast.add({
        color: "green",
        title: "Activité enregistrée"
      })
      refreshActivityListOrder()
    } else {
      toast.add({
        color: "red",
        title: "L'enregistrement a échoué",
        description: violations._error
      })
    }
  });
}

async function deleteRow(dataItem: DataItem) {
  dataItem.isUpdating = true
  activityQuery.delete(dataItem.activity).then(({error}) => {
    dataItem.isUpdating = false

    if (!error) {
      // We remove the activity from the array
      activities.value = activities.value.filter(actvt => actvt.activity.id !== dataItem.activity.id);
      refreshActivityListOrder()

      toast.add({
        color: "green",
        title: "Activité supprimée"
      })
    } else {
      toast.add({
        color: "red",
        title: "La suppression a échouée",
        description: error
      })
    }
  });
}


async function cancelRow(dataItem: DataItem) {
  if (!dataItem.activity.id) return;

  dataItem.isUpdating = true;
  const { retrieved } = await activityQuery.get(dataItem.activity.id);
  dataItem.isUpdating = false;
  if (retrieved) {
    dataItem.unsaved = false;
    dataItem.activity = retrieved;
  }
}

async function migrateRow(dataItem: DataItem) {
  if (!dataItem.activity.id || !migrationTarget.value) return;

  dataItem.isUpdating = true;
  activityQuery.mergeTo(dataItem.activity.id, migrationTarget.value).then(({error}) => {
    dataItem.isUpdating = false
    if (!error) {
      // We remove the activity from the array
      activities.value = activities.value.filter(actvt => actvt.activity.id !== dataItem.activity.id);
      refreshActivityListOrder()

      toast.add({
        color: "green",
        title: "Activité migrée"
      })
    } else {
      toast.add({
        color: "red",
        title: "La migration a échouée",
        description: error.message
      })
    }
  })

}

</script>

<template>
  <div>
    <div class="flex justify-end mb-4">
      <UButton label="Créer une nouvelle activité" @click="addActivity()"/>
    </div>

    <UCard>
      <UTable
          :loading="isLoading"
          class="w-full"
          :columns="columns"
          :rows="activities">
        <template #empty-state>
          <div class="flex flex-col items-center justify-center py-6 gap-3">
            <span class="italic text-sm">Aucune activité enregistrée</span>
            <UButton class="mt-4" label="Créer" @click="addActivity()"/>
          </div>
        </template>

        <template #activity.name-data="{row}">
          <UInput
              :model-value="row.activity.name"
              variant="none"
              class="hover:bg-gray-50 hover:dark:bg-gray-900 min-w-44"
              :disabled="row.isUpdating"
              @input="event => updateText(event, row)" />
        </template>

        <template #activity.isEnabled-data="{row}">
          <UToggle :model-value="row.activity.isEnabled" :disabled="row.isUpdating" @click="toggleClicked(row)" />
        </template>

        <template #actions-data="{row}">
          <div class="w-96 flex gap-4">
            <UButton v-if="row.unsaved" color="green" label="Enregister" :disabled="row.isUpdating" @click="saveRow(row)"/>
            <UButton v-if="row.unsaved" label="Annuler" :disabled="row.isUpdating" @click="cancelRow(row)"/>
            <UPopover v-if="!row.activity.isEnabled" overlay>
              <UButton color="orange" label="Migrer" :disabled="row.isUpdating" />

              <template #panel>
                <div class="p-4 w-[42rem] flex flex-col">
                  <div class="text-center text-lg font-bold">{{ row.activity.name }}</div>
                  <UAlert
                      class="my-4"
                      color="yellow"
                      variant="soft"
                      title="Une fois la migration effectuée, l'activité sera supprimée."
                  />
                  <UFormGroup class="mb-4" label="Activité cible">
                    <USelect required v-model="migrationTarget" :options="activities" option-attribute="activity.name" value-attribute="activity.id" />
                  </UFormGroup>
                  <UButton class="mx-auto" color="orange" label="Migrer" :disabled="row.isUpdating" @click="migrateRow(row)" />
                </div>
              </template>
            </UPopover>
            <UPopover v-if="!row.activity.isEnabled" overlay>
              <UButton color="red" label="Supprimer" :disabled="row.isUpdating" />

              <template #panel>
                <div class="p-4 w-[42rem] flex flex-col">
                  <div class="text-center text-lg font-bold">{{ row.activity.name }}</div>
                  <UAlert
                      class="my-4"
                      color="orange"
                      variant="soft"
                      title="La suppression d'une activité, supprimera aussi toutes les activités des membres liées."
                      description="Il conseillé de faire un migration à la place."
                  />
                  <UButton class="mx-auto" color="red" label="Valider la suppression" :disabled="row.isUpdating" @click="deleteRow(row)" />
                </div>
              </template>
            </UPopover>
          </div>
        </template>

      </UTable>
    </UCard>

  </div>
</template>


<style lang="scss" scoped>

</style>

