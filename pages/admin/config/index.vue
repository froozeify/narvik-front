<script setup lang="ts">

import GlobalSettingQuery from "~/composables/api/query/GlobalSettingQuery";
import type {GlobalSetting} from "~/types/api/item/globalSetting";
import clipboard from "clipboardy";
import ActivityQuery from "~/composables/api/query/ActivityQuery";
import type {Activity} from "~/types/api/item/activity";
import type {Image} from "~/types/api/item/image";
import {useSelfMemberStore} from "~/stores/useSelfMember";
import {useAppConfigStore} from "~/stores/useAppConfig";
import {displayFileErrorToast, displayFileSuccessToast, getFileFormDataFromUInputChangeEvent} from "~/utils/file";

definePageMeta({
  layout: "admin"
});

useHead({
  title: 'Configuration globale'
})

const toast = useToast()

const globalSettingQuery = new GlobalSettingQuery();
const activityQuery = new ActivityQuery();

const badgerSetting: Ref<GlobalSetting | undefined> = ref(undefined);
globalSettingQuery.get("BADGER_TOKEN").then(value =>  {
  badgerSetting.value = value.retrieved
})

const controlShootingSetting: Ref<GlobalSetting | undefined> = ref(undefined);
const selectedControlShootingActivityValue: Ref<string | undefined> = ref(undefined);
const selectedControlShootingActivity: Ref<Activity | undefined> = ref(undefined);

const ignoredActivitiesOpeningStatsSetting: Ref<GlobalSetting | undefined> = ref(undefined);
const excludedActivitiesFromCount: Ref<string[]> = ref([]);

globalSettingQuery.get("CONTROL_SHOOTING_ACTIVITY_ID").then(value => {
  controlShootingSetting.value = value.retrieved
  if (controlShootingSetting.value && controlShootingSetting.value.value) {
    getActivity(controlShootingSetting.value.value).then(actvt => {
      selectedControlShootingActivity.value = actvt
      selectedControlShootingActivityValue.value = actvt?.id?.toString()
    })
  }
})

globalSettingQuery.get("IGNORED_ACTIVITIES_OPENING_STATS").then(value => {
  ignoredActivitiesOpeningStatsSetting.value = value.retrieved
  if (ignoredActivitiesOpeningStatsSetting.value && ignoredActivitiesOpeningStatsSetting.value.value) {
    excludedActivitiesFromCount.value = JSON.parse(ignoredActivitiesOpeningStatsSetting.value.value)
  }
})

const activities: Ref<Activity[] | undefined> = ref(undefined);
activityQuery.getAll().then(value => {
  activities.value = value.items
})

const logoUploading = ref(false)
const state = reactive({
  file: undefined
})

const selfStore = useSelfMemberStore();
const appConfigStore = useAppConfigStore();

const siteLogo: Ref<Image|null> = appConfigStore.getLogo()

function copyBadgerLink() {
  if (!badgerSetting.value) return;

  clipboard.write(window.location.origin + '/login/bdg/' + badgerSetting.value.value)
  toast.add({
    title: 'URL Copiée',
    color: "green"
  })
}

async function controlShootingUpdated() {
  if (selectedControlShootingActivityValue.value) {
    const activity = await getActivity(selectedControlShootingActivityValue.value);
    selectedControlShootingActivity.value = activity
  }

  if (!controlShootingSetting.value || !selectedControlShootingActivity.value) return;

  const payload: GlobalSetting = {
    value: selectedControlShootingActivity.value.id?.toString()
  }

  let { updated, error } = await globalSettingQuery.patch(controlShootingSetting.value, payload);

  if (error) {
    toast.add({
      color: "red",
      title: "L'enregistrement a échoué",
      description: error.message
    });
    return;
  }

  toast.add({
    color: "green",
    title: "Paramètre enregistré"
  });
}

async function ignoredActivitiesDaysUpdated() {
  if (!ignoredActivitiesOpeningStatsSetting.value || !excludedActivitiesFromCount.value) return;

  const payload: GlobalSetting = {
    value: JSON.stringify(excludedActivitiesFromCount.value)
  }

  let { updated, error } = await globalSettingQuery.patch(ignoredActivitiesOpeningStatsSetting.value, payload);

  if (error) {
    toast.add({
      color: "red",
      title: "L'enregistrement a échoué",
      description: error.message
    });
    return;
  }

  toast.add({
    color: "green",
    title: "Paramètre enregistré"
  });
}

async function getActivity(id: string) {
  const response = await activityQuery.get(id);
  return response.retrieved;
}

async function uploadLogo(event) {
  const formData = getFileFormDataFromUInputChangeEvent(event);

  if (!formData) {
    return;
  }

  logoUploading.value = true
  const { created, error } = await globalSettingQuery.importLogo(formData)
  logoUploading.value = false

  if (error) {
    return displayFileErrorToast(error.message)
  }

  displayFileSuccessToast('Logo envoyé')
  await appConfigStore.refresh()
  siteLogo.value = appConfigStore.getLogo(false).value
}

async function deleteLogo() {
  logoUploading.value = true

  const formData = new FormData()

  const { created, error } = await globalSettingQuery.importLogo(formData)
  logoUploading.value = false

  if (error) {
    toast.add({
      title: "Erreur lors de la suppression du logo",
      description: error.message,
      color: "red"
    })
    return
  }

  await appConfigStore.refresh()
  siteLogo.value = appConfigStore.getLogo(false).value
  toast.add({
    title: "Logo supprimé",
    color: "green"
  })

}


</script>

<template>
  <div class="grid gap-4 md:grid-cols-3">
    <UCard class="md:col-span-3">
      <div class="text-xl font-bold mb-4">Lien de connexion badger</div>
      <div>A mettre en favoris sur l'ordinateur accessible publiquement.</div>
      <div>Ce lien permet d'être automatiquement connecté en tant que badgeuse (accès seulement à la liste de présence).</div>
      <div>Le lien peut être déposé directement dans la barre personnelle pour le marquer en favoris.</div>
      <div v-if="!badgerSetting" class="mt-4">
        <UAlert
                class="mt-4"
                icon="i-heroicons-exclamation-triangle"
                color="red"
                title="Token de connexion non défini"
                description="Si cette affichage ne change pas au bout de quelques minutes, il se peut que le script de post-installation n'a pas été exécuté."
        />
      </div>
      <div v-else
         class="break-words cursor-pointer mt-4"
         @click.prevent="copyBadgerLink"
        >

        <UAlert v-if="!badgerSetting.value"
                class="mb-4"
                icon="i-heroicons-exclamation-triangle"
                color="red"
                title="Token de connexion non défini"
                description="Cela peut arriver lorsque le script de post-installation n'a pas été exécuté."
        />

        <a v-else :href="'/login/bdg/' + badgerSetting.value"
           class="focus:outline-none disabled:cursor-not-allowed disabled:opacity-75 flex-shrink-0 font-medium rounded-md text-sm gap-x-1.5 px-2.5 py-1.5 shadow-sm text-white dark:text-gray-900 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-500 dark:bg-yellow-400 dark:hover:bg-yellow-500 dark:disabled:bg-yellow-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-500 dark:focus-visible:outline-yellow-400 flex justify-center"
        >
          Gestion de présence
        </a>
      </div>
    </UCard>

    <div>
      <UCard class="h-fit">
        <div class="text-xl font-bold mb-4">Activité correspondant au tir de contrôle</div>
        <div v-if="!controlShootingSetting" class="mt-4">
          <USkeleton class="h-4 w-full" />
        </div>
        <div v-else>
          <USelect
            v-model="selectedControlShootingActivityValue"
            @change="controlShootingUpdated"
            :options="activities"
            option-attribute="name"
            value-attribute="id"
            placeholder="Tir de contrôle non défini" />
        </div>
      </UCard>

      <UCard class="h-fit mt-4">
        <div class="text-xl font-bold mb-4">Activités exclus du compte des jours ouverts</div>
        <div v-if="!ignoredActivitiesOpeningStatsSetting" class="mt-4">
          <USkeleton class="h-4 w-full" />
        </div>
        <div v-else>
          <USelectMenu
            v-model="excludedActivitiesFromCount"
            @change="ignoredActivitiesDaysUpdated"
            :options="activities"
            option-attribute="name"
            value-attribute="id"
            multiple
          >
            <template #label>
              <span v-if="excludedActivitiesFromCount && activities && excludedActivitiesFromCount.length" class="truncate">
                {{ activities.filter(a => (a.id && excludedActivitiesFromCount?.includes(a.id)) ).map(a => a.name).join(', ') }}
              </span>
              <span v-else>Aucune activités exclus</span>
            </template>
          </USelectMenu>
        </div>
      </UCard>

    </div>

    <UCard>
      <div class="text-xl font-bold mb-4">Logo</div>
      <div v-if="siteLogo" class="mt-4 flex justify-center">
        <img :src="siteLogo.base64" class="w-48" />
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

      <UPopover overlay v-if="siteLogo">
        <UButton color="red">
          Supprimer le logo
        </UButton>

        <template #panel="{ close }">
          <div class="p-4 w-56 flex flex-col gap-4">
            <div class="text-center text-lg font-bold">Êtes-vous certain ?</div>

            <UButton color="red" @click="deleteLogo" class="mx-auto">
              Supprimer le logo
            </UButton>
          </div>
        </template>

      </UPopover>

    </UCard>
  </div>
</template>


<style lang="scss" scoped>

</style>

