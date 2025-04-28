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
  title: 'Configuration présences'
})

const toast = useToast()
const overlay = useOverlay()

const selfStore = useSelfUserStore();
const { selectedProfile } = storeToRefs(selfStore)

const badgerSetting: Ref<string | undefined> = ref(selectedProfile.value?.club.badgerToken);

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
</script>

<template>
  <div class="grid gap-4 md:grid-cols-2">
    <GenericCardWithActions class="md:col-span-2" title="Connexion en mode badgeuse/pointeuse">
      <template #actions>
        <UButton
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
      </template>

      <template #default>
        <p>A mettre en favoris sur l'ordinateur accessible publiquement.</p>
        <p>Ce lien permet d'être automatiquement connecté en tant que badgeuse (accès seulement à l'enregistrement des présences).</p>
        <p class="mb-4">Le lien peut être déposé directement dans la barre personnelle pour le marquer en favoris.</p>

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
          <ContentLink :to="getBadgerLoginPath()" class="text-[.6rem] break-all">{{ getBadgerLoginPath() }}</ContentLink>
        </div>

        <UButton class="mt-4" to="https://docs.narvik.app/frontend/docs/membres/presences.html#connexion-en-mode-badgeuse-pointeuse" target="_blank">Documentation</UButton>
      </template>
    </GenericCardWithActions>
  </div>
</template>


<style lang="css" scoped>

</style>

