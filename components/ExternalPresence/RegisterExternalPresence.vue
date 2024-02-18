<script setup lang="ts">
import ActivityQuery from "~/composables/api/query/ActivityQuery";
import type {Activity} from "~/types/activity";
import type {PropType, Ref} from "vue";
import type {Member} from "~/types/member";
import type {FormSubmitEvent} from "#ui/types";
import type {MemberPresence} from "~/types/memberpresence";
import MemberPresenceQuery from "~/composables/api/query/MemberPresenceQuery";
import type {SubmissionErrors} from "~/types/error";
import type {ExternalPresence} from "~/types/externalpresence";
import ExternalPresenceQuery from "~/composables/api/query/ExternalPresenceQuery";
import {useExternalPresenceStore} from "~/stores/useExternalPresence";

const props = defineProps({
  externalPresence: {
    type: Object as PropType<ExternalPresence>,
    required: false
  },
});

const emit = defineEmits([
  'registered',
  'canceled'
])

const toast = useToast()

const externalPresenceQuery = new ExternalPresenceQuery();


const isLoading: Ref<boolean> = ref(true)
const isSubmitting: Ref<boolean> = ref(false)
const activities: Ref<Activity[]> = ref([])

const state = reactive({
  licence: undefined as string|undefined,
  firstname: undefined as string|undefined,
  lastname: undefined as string|undefined,
  activities: []
})

if (props.externalPresence) {
  state.licence = props.externalPresence.licence
  state.firstname = props.externalPresence.firstname
  state.lastname = props.externalPresence.lastname

  state.activities = []
  props.externalPresence.activities?.forEach(actvt => {
    if (!actvt.isEnabled) {
      state.activities[actvt.id] = false
    } else {
      state.activities[actvt.id] = true
    }
  });
}

const activityQuery = new ActivityQuery();
activityQuery.getAll().then(value => {
  isLoading.value = false;
  activities.value = value.items.value
      .filter((actvt) => actvt.isEnabled) // We don't display the disabled activities
      .sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1))
});

async function onSubmit(event: FormSubmitEvent<any>) {
  isSubmitting.value = true;

  let externalPresence: ExternalPresence = {
    licence: event.data.licence,
    firstname: event.data.firstname,
    lastname: event.data.lastname,
    fullName: '',
    activities: []
  }

  event.data.activities.forEach( (checked: boolean, actvt: string) => {
    if (checked) {
      externalPresence.activities.push(activityQuery.rootPath + "/" + actvt)
    }
  })

  let item: ExternalPresence | undefined = undefined;
  let queryViolations: Ref<SubmissionErrors | undefined> = ref(undefined);
  if (!props.externalPresence) {
    let { created, violations, error } = await externalPresenceQuery.post(externalPresence);
    item = created.value
    queryViolations = violations;
  } else {
    let { updated, violations, error } = await externalPresenceQuery.patch(props.externalPresence, externalPresence);
    item = updated.value
    queryViolations = violations;
  }

  isSubmitting.value = false;
  if (queryViolations.value) {
    toast.add({
      color: "red",
      title: "L'enregistrement a échoué",
      description: queryViolations.value._error
    });
    return;
  }

  if (item) {
    useExternalPresenceStore().addItem(item);

    toast.add({
      title: "Présence enregistrée"
    });
    emit('registered', item)
  }
}

</script>

<template>
  <UCard>
    <div v-if="isLoading" class="h-full">
      <USkeleton class="h-8 w-36" />
      <USkeleton class="h-4 w-12 my-4" />

      <div class="grid grid-cols-2 gap-4">
        <div v-for="i in 11" class="h-6 flex gap-4 basis-1/2 w-full">
          <USkeleton class="w-6" />
          <USkeleton class="w-full" />
        </div>
      </div>

      <USkeleton class="mt-4 h-6 w-full" />
    </div>

    <div v-else>
      <div v-if="state.lastname" class="text-2xl">Enregistrement pour <b>{{ state.lastname }} {{ state.firstname }}</b></div>
      <div v-else class="text-2xl">Enregistrement tireur externe</div>

      <UForm :state="state" @submit="onSubmit" class="mt-4">
        <UInput
            v-model="state.licence"
            :disabled="props.externalPresence !== undefined"
            placeholder="Licence"
        />

        <UInput class="my-4"
          v-model="state.lastname"
          :disabled="props.externalPresence !== undefined"
          placeholder="Nom"
        />

        <UInput
            v-model="state.firstname"
            :disabled="props.externalPresence !== undefined"
            placeholder="Prénom"
        />

        <div class="mt-4">Activités</div>
        <UFormGroup name="activities" class="my-4">
          <div class="grid grid-cols-2 gap-2 gap-y-2 ">
            <UCheckbox
                class="w-full"
                v-for="activity in activities"
                v-model="state.activities[activity.id]"
                :name="'actvt-' + activity.id"
                :label="activity.name" />
          </div>
        </UFormGroup>

        <UButton :loading="isSubmitting" block type="submit">
          Enregistrer
        </UButton>
        <UButton class="mt-2" color="red" :loading="isSubmitting" block @click="emit('canceled')">
          Annuler
        </UButton>
      </UForm>
    </div>
  </UCard>
</template>

<style scoped lang="scss">

</style>
