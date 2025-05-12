<script lang="ts" setup>

import {useSelfUserStore} from "~/stores/useSelfUser";
import dayjs from "dayjs";

definePageMeta({
  layout: "admin"
});

useHead({
  title: ''
})

const selfStore = useSelfUserStore();
const { selectedProfile } = storeToRefs(selfStore)

</script>

<template>
  <div class="flex flex-col gap-4">
    <div v-if="selectedProfile?.club.createdAt && dayjs().isBefore(dayjs(selectedProfile?.club.createdAt).add(14, 'days'))">
      <UAlert title="Besoin d'aide pour la mise en route ?">
        <template #description>
          <div class="flex flex-col md:flex-row gap-2 justify-between">
            <div>
              <p>N'hésitez pas à suivre notre <a class="underline" href="https://docs.narvik.app/frontend/premiers-pas/association.html" target="_blank">guide de démarrage rapide</a>, ou bien <a class="underline" href="https://about.narvik.app/contact" target="_blank">prendre contact</a> avec nous afin que nous vous accompagnions.</p>
            </div>

            <div class="w-44 md:text-right">
              <UButton
                to='https://docs.narvik.app/frontend/premiers-pas/association.html'
                target='_blank'
                color='neutral'
                variant='subtle'
                size="xs"
              >
                Afficher le guide
              </UButton>
            </div>
          </div>
        </template>
      </UAlert>
    </div>
    <MetricGlobal />
  </div>
</template>
