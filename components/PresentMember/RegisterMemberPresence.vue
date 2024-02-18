<script setup lang="ts">
import ActivityQuery from "~/composables/api/query/ActivityQuery";
import type {Activity} from "~/types/activity";
import type {PropType, Ref} from "vue";
import type {Member} from "~/types/member";
import type {FormSubmitEvent} from "#ui/types";
import type {MemberPresence} from "~/types/memberpresence";
import MemberPresenceQuery from "~/composables/api/query/MemberPresenceQuery";
import type {SubmissionErrors} from "~/types/error";

const props = defineProps({
  member: {
    type: Object as PropType<Member>,
    required: false
  },
  memberPresence: {
    type: Object as PropType<MemberPresence>,
    required: false
  }
});

const emit = defineEmits([
  'registered',
  'canceled'
])

const toast = useToast()

const memberPresenceQuery = new MemberPresenceQuery();


const isLoading: Ref<boolean> = ref(true)
const isSubmitting: Ref<boolean> = ref(false)
const activities: Ref<Activity[]> = ref([])

const state = reactive({
  member: props.member,
  activities: []
})

if (props.memberPresence) {
  state.member = props.memberPresence.member
  state.activities = []
  props.memberPresence.activities?.forEach(actvt => {
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

  let memberPresence: MemberPresence = {
    member: undefined,
    activities: []
  }
  if (props.member) {
    memberPresence.member = props.member?.["@id"]
  } else if (props.memberPresence) {
    delete memberPresence.member // We remove the member key since we only update the activities (PATCH request)
  }

  event.data.activities.forEach( (checked: boolean, actvt: string) => {
    if (checked) {
      memberPresence.activities.push(activityQuery.rootPath + "/" + actvt)
    }
  })

  let item: MemberPresence | undefined = undefined;
  let queryViolations: Ref<SubmissionErrors | undefined> = ref(undefined);
  if (!props.memberPresence) {
    let { created, violations, error } = await memberPresenceQuery.post(memberPresence);
    item = created.value
    queryViolations = violations;
  } else {
    let { updated, violations, error } = await memberPresenceQuery.patch(props.memberPresence, memberPresence);
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

  toast.add({
    title: "Présence enregistrée"
  });

  emit('registered', item)
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
      <div class="text-2xl">Enregistrement pour <b>{{ state.member.fullName }}</b></div>

      <UForm :state="state" @submit="onSubmit">
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
