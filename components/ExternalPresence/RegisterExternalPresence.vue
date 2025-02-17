<script setup lang="ts">
import ActivityQuery from "~/composables/api/query/clubDependent/plugin/presence/ActivityQuery";
import type {Activity} from "~/types/api/item/clubDependent/plugin/presence/activity";
import type {PropType, Ref} from "vue";
import type {FormSubmitEvent} from "#ui/types";
import type {ExternalPresence} from "~/types/api/item/clubDependent/plugin/presence/externalPresence";
import ExternalPresenceQuery from "~/composables/api/query/clubDependent/plugin/presence/ExternalPresenceQuery";
import {useExternalPresenceStore} from "~/stores/useExternalPresence";
import RegisterMemberPresence from "~/components/PresentMember/RegisterMemberPresence.vue";
import SearchMember from "~/components/Member/SearchMember.vue";
import type {Member} from "~/types/api/item/clubDependent/member";
import MemberQuery from "~/composables/api/query/clubDependent/MemberQuery";
import {useSelfUserStore} from "~/stores/useSelfUser";

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
const selfStore = useSelfUserStore()

const isSupervisor = selfStore.hasSupervisorRole()
const isBadger = selfStore.isBadger()

const isLoading: Ref<boolean> = ref(true)
const isSubmitting: Ref<boolean> = ref(false)
const activities: Ref<Activity[]> = ref([])

const registerMemberPresenceModal = ref(false)
const matchedMember: Ref<Member|null> = ref(null)

const state = reactive({
  licence: undefined as string|undefined,
  firstname: undefined as string|undefined,
  lastname: undefined as string|undefined,
  activities: [] as Array<Activity>
})

watch(state, async (value) => {
  if (!value.licence || value.licence.length < 8) return;
  // We search if by any chance we already have the member registered
  const memberQuery = new MemberQuery();
  const searchResult = await memberQuery.search(value.licence);
  if (searchResult.error || !searchResult.item) return;

  if (searchResult.item.length !== 1) return;

  matchedMember.value = searchResult.item[0];
  registerMemberPresenceModal.value = true
})

if (props.externalPresence) {
  state.licence = props.externalPresence.licence
  state.firstname = props.externalPresence.firstname
  state.lastname = props.externalPresence.lastname

  state.activities = []
  props.externalPresence.activities?.forEach(actvt => {
    if (actvt.isEnabled) {
      state.activities.push(actvt)
    }
  });
}

const activityQuery = new ActivityQuery();
activityQuery.getAll().then(value => {
  isLoading.value = false;
  activities.value = value.items
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

  event.data.activities.forEach( (actvt: Activity) => {
    if (actvt["@id"]) {
      externalPresence.activities.push(actvt["@id"])
    }
  })

  let item: ExternalPresence | undefined = undefined;
  let isUpdating = false
  let error: Error | undefined = undefined;

  if (!props.externalPresence) {
    let { created, error: errorMessage } = await externalPresenceQuery.post(externalPresence);
    item = created
    error = errorMessage
  } else {
    let { updated, error: errorMessage } = await externalPresenceQuery.patch(props.externalPresence, externalPresence);
    isUpdating = true
    item = updated
    error = errorMessage
  }

  isSubmitting.value = false;
  if (error) {
    toast.add({
      color: "red",
      title: "L'enregistrement a échoué",
      description: error.message
    });
    return;
  }

  if (item) {
    if (isUpdating) {
      useExternalPresenceStore().updateItem(item);
    } else {
      useExternalPresenceStore().addItem(item);
    }

    toast.add({
      title: !isUpdating ? "Présence enregistrée" : "Présence modifiée"
    });
    emit('registered', item)
  }
}

function presenceRegistered() {
  registerMemberPresenceModal.value = false
  emit('registered')
}

function presenceCanceled() {
  registerMemberPresenceModal.value = false
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
            :disabled="props.externalPresence !== undefined && !(isSupervisor || isBadger)"
            placeholder="Licence"
        />

        <UInput class="my-4"
          v-model="state.lastname"
          required
          :disabled="props.externalPresence !== undefined && !(isSupervisor || isBadger)"
          placeholder="Nom"
        />

        <UInput
            v-model="state.firstname"
            required
            :disabled="props.externalPresence !== undefined && !(isSupervisor || isBadger)"
            placeholder="Prénom"
        />

        <div class="mt-4">Activités</div>
        <div class="my-4">
          <div class="grid grid-cols-2 gap-2 gap-y-2 ">
            <UCheckbox
                class="w-full"
                v-for="activity in activities"
                v-model="state.activities"
                :value="activity"
                :name="'actvt-' + activity.uuid"
                :label="activity.name" />
          </div>
        </div>

        <UButton :loading="isSubmitting" block type="submit">
          Enregistrer
        </UButton>
        <UButton class="mt-2" color="red" :loading="isSubmitting" block @click="emit('canceled')">
          Annuler
        </UButton>
      </UForm>
    </div>
  </UCard>

  <UModal
      v-model="registerMemberPresenceModal">
      <RegisterMemberPresence :member="matchedMember" @registered="presenceRegistered" @canceled="presenceCanceled" />
  </UModal>
</template>

<style scoped lang="scss">

</style>
