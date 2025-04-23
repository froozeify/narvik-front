<script setup lang="ts">

import clipboard from "clipboardy";
import ActivityQuery from "~/composables/api/query/clubDependent/plugin/presence/ActivityQuery";
import type {Activity} from "~/types/api/item/clubDependent/plugin/presence/activity";
import {useSelfUserStore} from "~/stores/useSelfUser";
import {convertUuidToUrlUuid} from "~/utils/resource";
import type {WriteClubSetting} from "~/types/api/item/clubDependent/clubSetting";
import ClubSettingQuery from "~/composables/api/query/clubDependent/ClubSettingQuery";
import ClubModalGenerateBadger from "~/components/Club/ClubModalGenerateBadger.vue";
import type {SelectApiItem} from "~/types/select";
import type {Club} from "~/types/api/item/club";
import type {Season} from "~/types/api/item/season";

definePageMeta({
  layout: "admin"
});

useHead({
  title: 'Configuration globale'
})

const toast = useToast()
const overlay = useOverlay()

const selfStore = useSelfUserStore();
const { selectedProfile } = storeToRefs(selfStore)

const clubSettingQuery = new ClubSettingQuery();
const activityQuery = new ActivityQuery();

const badgerSetting: Ref<string | undefined> = ref(selectedProfile.value?.club.badgerToken);

const configState = reactive({
  selectedControlShootingActivity: selectedProfile.value?.club.settings.controlShootingActivity?.uuid,
  excludedActivitiesFromOpeningDays: selectedProfile.value?.club.settings.excludedActivitiesFromOpeningDays?.map((a: Activity) => a.uuid),
  selectedMonth: selectedProfile.value?.club.settings.seasonEnd.split('-')[0].toString(),
  selectedDay: selectedProfile.value?.club.settings.seasonEnd.split('-')[1].toString(),
})
// const selectedControlShootingActivity: Ref<Activity | undefined> = ref(undefined);

const activities: Ref<Activity[] | undefined> = ref(undefined);
activityQuery.getAll().then(value => {
  activities.value = value.items
})
const activitiesSelect = computed( () => {
  const items: SelectApiItem<Activity>[] = []
  activities.value?.forEach(value => {
    items.push({
      label: value.name,
      value: value.uuid,
      item: value
    })
  })
  return items;
})

const logoUploading = ref(false)
const state = reactive({
  file: undefined
})

const monthsSelect: SelectApiItem<Season>[] = [
  {
    value: '01',
    label: 'Janvier'
  },
  {
    value: '02',
    label: 'Février'
  },
  {
    value: '03',
    label: 'Mars'
  },
  {
    value: '04',
    label: 'Avril'
  },
  {
    value: '05',
    label: 'Mai'
  },
  {
    value: '06',
    label: 'Juin'
  },
  {
    value: '07',
    label: 'Juillet'
  },
  {
    value: '08',
    label: 'Août'
  },
  {
    value: '09',
    label: 'Septembre'
  },
  {
    value: '10',
    label: 'Octobre'
  },
  {
    value: '11',
    label: 'Novembre'
  }
  ,{
    value: '12',
    label: 'Décembre'
  }
]

const daysSelect = computed( () => {
  const items: SelectApiItem<Season>[] = []

  let maxDays = 31
  if (configState.selectedMonth.value) {
    if (['04', '06', '09', '11'].includes(configState.selectedMonth.value.toString())) {
      maxDays = 30
    }

    if (configState.selectedMonth.value.toString() === '02') {
      maxDays = 28
    }
  }

  for (let i = maxDays; i > 0; i--) {
    items.push({
      label: i.toString(),
      value: i < 10 ? '0' + i.toString() : i.toString()
    })
  }

  return items;
})


function getBadgerLoginPath(): string|undefined {
  if (!badgerSetting.value || !selectedProfile.value) {
    return undefined
  }

  return `/login/bdg/${convertUuidToUrlUuid(selectedProfile.value.club.uuid)}/${badgerSetting.value}`
}

function copyBadgerLink() {
  if (!getBadgerLoginPath()) return;

  clipboard.write(window.location.origin + getBadgerLoginPath())
  toast.add({
    title: 'URL Copiée',
    color: "success"
  })
}

async function controlShootingUpdated() {
  if (!selectedProfile.value?.club.settings) return;

  if (configState.selectedControlShootingActivity) {
    selectedControlShootingActivity.value = await getActivity(configState.selectedControlShootingActivity)
  }

  if (!selectedControlShootingActivity.value) return;

  const payload: WriteClubSetting = {
    controlShootingActivity: selectedControlShootingActivity.value["@id"]
  }

  let { updated, error } = await clubSettingQuery.patch(selectedProfile.value.club.settings, payload);

  if (error) {
    toast.add({
      color: "error",
      title: "L'enregistrement a échoué",
      description: error.message
    });
    return;
  }

  selfStore.refreshSelectedClub().then()

  toast.add({
    color: "success",
    title: "Paramètre enregistré"
  });
}

async function ignoredActivitiesDaysUpdated() {
  if (!selectedProfile.value?.club.settings) return;

  const uris: string[] = []
  if (configState.excludedActivitiesFromOpeningDays) {
    for (const excludedActivity of configState.excludedActivitiesFromOpeningDays) {
      uris.push(`${activityQuery.getRootUrl()}/${excludedActivity}`)
    }
  }

  const payload: WriteClubSetting = {
    excludedActivitiesFromOpeningDays: uris
  }

  let { updated, error } = await clubSettingQuery.patch(selectedProfile.value.club.settings, payload);

  if (error) {
    toast.add({
      color: "error",
      title: "L'enregistrement a échoué",
      description: error.message
    });
    return;
  }

  selfStore.refreshSelectedClub().then()

  toast.add({
    color: "success",
    title: "Paramètre enregistré"
  });
}

async function getActivity(id: string) {
  const response = await activityQuery.get(id);
  return response.retrieved;
}

async function uploadLogo(event) {
  if (!selectedProfile.value?.club.settings) return;

  const formData = getFileFormDataFromUInputChangeEvent(event);

  if (!formData) {
    return;
  }

  logoUploading.value = true
  const { created, error } = await clubSettingQuery.importLogo(selectedProfile.value.club.settings, formData)
  logoUploading.value = false

  if (error) {
    return displayFileErrorToast(error.message)
  }

  displayFileSuccessToast('Logo envoyé')
  await selfStore.refreshSelectedClub()
}

async function deleteLogo() {
  if (!selectedProfile.value?.club.settings) return;

  logoUploading.value = true

  const formData = new FormData()

  const { created, error } = await clubSettingQuery.importLogo(selectedProfile.value.club.settings, formData)
  logoUploading.value = false

  if (error) {
    toast.add({
      title: "Erreur lors de la suppression du logo",
      description: error.message,
      color: "error"
    })
    return
  }

  await selfStore.refreshSelectedClub()
  displayFileSuccessToast('Logo supprimé')
}

async function seasonEndUpdated() {
  if (!selectedProfile.value?.club.settings ||
      !configState.selectedDay ||
      !configState.selectedMonth
  ) return;

  const payload: WriteClubSetting = {
    seasonEnd: `${configState.selectedMonth}-${configState.selectedDay}`
  }

  let { updated, error } = await clubSettingQuery.patch(selectedProfile.value.club.settings, payload);

  if (error) {
    toast.add({
      color: "error",
      title: "L'enregistrement a échoué",
      description: error.message
    });
    return;
  }

  selfStore.refreshSelectedClub().then()

  toast.add({
    color: "success",
    title: "Paramètre enregistré"
  });
}

</script>

<template>
  <div class="grid gap-4 md:grid-cols-2">
    <GenericCard class="md:col-span-2" title="Lien de connexion badger">
      <p>A mettre en favoris sur l'ordinateur accessible publiquement.</p>
      <p>Ce lien permet d'être automatiquement connecté en tant que badgeuse (accès seulement à la liste de présence).</p>
      <p>Le lien peut être déposé directement dans la barre personnelle pour le marquer en favoris.</p>

      <UButton
        class="my-4"
        @click="
          overlay.create(ClubModalGenerateBadger).open({
            onGenerated(newClub: Club) {
              badgerSetting = newClub.badgerToken
              selfStore.refreshSelectedClub()
              useToast().add({title: 'Lien de connexion généré'})
            }
          })"
      >
        Générer un nouveau lien
      </UButton>

      <div v-if="!badgerSetting">
        <UAlert
          icon="i-heroicons-exclamation-triangle"
          color="warning"
          title="Lien de connexion non généré."
        />
      </div>
      <div v-else
         class="break-words cursor-pointer"
         @click.prevent="copyBadgerLink"
        >

        <a :href="getBadgerLoginPath()"
           class="focus:outline-none disabled:cursor-not-allowed disabled:opacity-75 flex-shrink-0 font-medium rounded-md text-sm gap-x-1.5 px-2.5 py-1.5 shadow-sm text-white dark:text-gray-900 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-500 dark:bg-yellow-400 dark:hover:bg-yellow-500 dark:disabled:bg-yellow-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-500 dark:focus-visible:outline-yellow-400 flex justify-center"
        >
          Gestion de présence
        </a>
      </div>
    </GenericCard>

    <GenericCard title="Activités exclus du compte des jours ouverts">
      <div>
        <USelectMenu
          v-model="configState.excludedActivitiesFromOpeningDays"
          @change="ignoredActivitiesDaysUpdated"
          :items="activitiesSelect"
          value-key="value"
          multiple
        >
          <template #default>
            <span v-if="configState.excludedActivitiesFromOpeningDays && activities && configState.excludedActivitiesFromOpeningDays.length" class="truncate">
              {{ activities.filter(a => (a.uuid && configState.excludedActivitiesFromOpeningDays?.includes(a.uuid)) ).map(a => a.name).join(', ') }}
            </span>
            <span v-else>Aucune activités exclus</span>
          </template>
        </USelectMenu>
      </div>
    </GenericCard>

    <GenericCard title="Activité correspondante au contrôle">
      <div>
        <USelect
          v-model="configState.selectedControlShootingActivity"
          @change="controlShootingUpdated"
          :items="activitiesSelect"
          placeholder="Aucun contrôle défini" />
      </div>
    </GenericCard>

    <GenericCard title="Date de fin saison">
      <div>
        <p class="mb-4">Pour les activités sportives, une saison se termine souvent la 31 août afin de débuter en même temps que la rentrée des classes en septembre.</p>
        <div class="grid grid-cols-2 gap-2">
          <UFormField label="Mois">
            <USelect v-model="configState.selectedMonth" :items="monthsSelect" placeholder="Non défini" />
          </UFormField>

          <UFormField label="Jour">
            <USelect v-model="configState.selectedDay" :items="daysSelect" placeholder="Non défini" />
          </UFormField>
        </div>

        <UButton class="mt-4" label="Sauvegarder" @click="seasonEndUpdated" />

      </div>
    </GenericCard>

    <GenericCard title="Logo">
      <div v-if="selectedProfile?.club?.settings?.logoBase64" class="mt-4 flex justify-center">
        <NuxtImg :src="selectedProfile.club.settings.logoBase64" class="w-48" />
      </div>

      <UInput
          :loading="logoUploading"
          class="my-4"
          type="file"
          accept="image/png"
          icon="i-heroicons-paint-brush"
          @change="uploadLogo"
      />

      <UModal v-if="selectedProfile?.club.settings.logo">
        <UButton color="error">
          Supprimer le logo
        </UButton>

        <template #content>
          <UCard>
            <div class="flex flex-col gap-4">
              <div class="text-center text-lg font-bold">Êtes-vous certain ?</div>

              <UButton color="error" @click="deleteLogo" class="mx-auto">
                Supprimer le logo
              </UButton>
            </div>
          </UCard>
        </template>

      </UModal>

    </GenericCard>
  </div>
</template>


<style lang="css" scoped>

</style>

