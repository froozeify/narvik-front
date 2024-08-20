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
  title: 'Configuration email'
})

const toast = useToast()

interface SmtpConfig {
  on?: boolean,
  host?: string
  port?: string
  username?: string
  password?: string
  sender?: string
  senderName?: string
}

const globalSettingQuery = new GlobalSettingQuery();

const smtpSetting: Ref<SmtpConfig> = ref({});
globalSettingQuery.get("SMTP_ON").then(value =>  {
  let isOn = false
  if (value.retrieved && value.retrieved.value) {
    if (value.retrieved.value === '1' || value.retrieved.value.toLowerCase() === 'true') {
      isOn = true
    }
  }
  smtpSetting.value.on = isOn
})

</script>

<template>
  <div class="grid gap-4 md:grid-cols-3">
    <UCard class="md:col-span-2">
      <div class="text-xl font-bold mb-4">Configuration SMTP</div>
      <div>A mettre en favoris sur l'ordinateur accessible publiquement.</div>
      {{ smtpSetting }}
    </UCard>

    <UCard>
      <div class="text-xl font-bold mb-4">Tester</div>
      Input mail
      Bouton tester
    </UCard>
  </div>
</template>


<style lang="scss" scoped>

</style>

