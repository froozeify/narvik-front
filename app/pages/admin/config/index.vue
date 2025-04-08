<script setup lang="ts">

import clipboard from "clipboardy";
import ActivityQuery from "~/composables/api/query/clubDependent/plugin/presence/ActivityQuery";
import type {Activity} from "~/types/api/item/clubDependent/plugin/presence/activity";
import {useSelfUserStore} from "~/stores/useSelfUser";
import {convertUuidToUrlUuid} from "~/utils/resource";
import type {WriteClubSetting} from "~/types/api/item/clubDependent/clubSetting";
import ClubSettingQuery from "~/composables/api/query/clubDependent/ClubSettingQuery";
import ClubModalGenerateBadger from "~/components/Club/ClubModalGenerateBadger.vue";

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

interface SelectItem {
  label: string,
  value: string|undefined,
}

const configState = reactive({
  selectedControlShootingActivity: selectedProfile.value?.club.settings.controlShootingActivity?.uuid,
  excludedActivitiesFromOpeningDays: selectedProfile.value?.club.settings.excludedActivitiesFromOpeningDays?.map((a: Activity) => a.uuid)
})
const selectedControlShootingActivity: Ref<Activity | undefined> = ref(undefined);

const activities: Ref<Activity[] | undefined> = ref(undefined);
activityQuery.getAll().then(value => {
  activities.value = value.items
})
const activitiesSelect = computed( () => {
  const items: SelectItem[] = []
  activities.value?.forEach(value => {
    items.push({
      label: value.name,
      value: value.uuid
    })
  })
  return items;
})

const logoUploading = ref(false)
const state = reactive({
  file: undefined
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
      color: "red"
    })
    return
  }

  await selfStore.refreshSelectedClub()
  displayFileSuccessToast('Logo supprimé')
}


</script>

<template>
  <div class="grid gap-4 md:grid-cols-4">
    <GenericCard class="md:col-span-4" title="Lien de connexion badger">
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

    <div class="md:col-span-2">
      <GenericCard class="h-fit" title="Activités exclus du compte des jours ouverts">
        <div>
          <USelectMenu
            class="w-full"
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

      <GenericCard class="h-fit mt-4" title="Activité correspondante au contrôle">
        <div>
          <USelect
            class="w-full"
            v-model="configState.selectedControlShootingActivity"
            @change="controlShootingUpdated"
            :items="activitiesSelect"
            placeholder="Aucun contrôle défini" />
        </div>
      </GenericCard>
    </div>

    <GenericCard class="md:col-span-2" title="Logo">
      <div v-if="selectedProfile?.club?.settings?.logoBase64" class="mt-4 flex justify-center">
        <NuxtImg :src="selectedProfile.club.settings.logoBase64" class="w-48" />
      </div>

      <UInput
          :loading="logoUploading"
          class="my-4"
          type="file"
          accept="image/png"
          icon="i-heroicons-paint-brush"
          v-model="state.file"
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

