<script setup lang="ts">
import type {PropType} from "vue";
import ActivityQuery from "~/composables/api/query/ActivityQuery";
import type {Activity} from "~/types/activity";
import RegisterActivity from "~/components/Activity/RegisterActivity.vue";

const toast = useToast()

const props = defineProps({
  item: {
    type: Object as PropType<Activity>,
    required: true
  },
});

const emit = defineEmits([
  'updated',
])

const activityQuery = new ActivityQuery()

const activity: Ref<Activity> = ref(props.item)

const updateActivityModalOpen = ref(false);


function activityUpdated(newActivity: Activity) {
  updateActivityModalOpen.value = false;
  activity.value = newActivity
  emit('updated', newActivity)
}

</script>

<template>
  <UCard>
    <div class="flex justify-end">
      <UTooltip text="Editer" class="">
        <UButton
            @click="updateActivityModalOpen = true"
            icon="i-heroicons-pencil-square"
            size="xs"
            variant="ghost"
        />
      </UTooltip>
    </div>

    <div class="space-y-4 w-full mt-4">
      <div class="text-center text-2xl font-bold">
        TO REMOVE
        {{ activity.name }}
      </div>
      <div class="text-center text-xl ">
        <UToggle :model-value="activity.isEnabled" />
      </div>
    </div>
  </UCard>

  <UModal
      v-model="updateActivityModalOpen">
    <RegisterActivity
      :activity="activity"
      @registered="activityUpdated"
    />
  </UModal>
</template>

<style scoped lang="scss">

</style>
