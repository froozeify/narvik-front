<script setup lang="ts">
import type {PropType} from "vue";
import type {ExternalPresence} from "~/types/externalpresence";
import RegisterExternalPresence from "~/components/ExternalPresence/RegisterExternalPresence.vue";

const toast = useToast()

const props = defineProps({
  item: {
    type: Object as PropType<ExternalPresence>,
    required: true
  },
});

const emit = defineEmits([
  'updated',
])


const externalPresence: Ref<ExternalPresence> = ref(props.item)

const updateExternalPresenceModalOpen = ref(false);

function presenceUpdated(newExternalPresence: ExternalPresence) {
  updateExternalPresenceModalOpen.value = false;
  externalPresence.value = newExternalPresence
  emit('updated', newExternalPresence)
}

</script>

<template>
  <UCard class="bg-orange-50 dark:bg-orange-950">
    <div class="flex justify-end">
      <UTooltip text="Editer" class="">
        <UButton
            @click="updateExternalPresenceModalOpen = true"
            icon="i-heroicons-pencil-square"
            size="xs"
            color="orange"
            variant="ghost"
        />
      </UTooltip>
    </div>

    <div class="space-y-4 w-full mt-4">
      <div class="text-center text-2xl font-bold">
        {{ externalPresence.fullName }}
      </div>
      <div class="text-center text-xl">
        {{ externalPresence.licence }}
      </div>
      <div class="flex gap-4 justify-center flex-wrap">
        <UButton
            v-for="activity in externalPresence?.activities.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1))"
            color="orange"
            :ui="{ rounded: 'rounded-full' }"
        >
          {{ activity.name }}
        </UButton>
      </div>

    </div>
  </UCard>

  <UModal
      v-model="updateExternalPresenceModalOpen">
    <RegisterExternalPresence
      :external-presence="externalPresence"
      @registered="presenceUpdated"
    />
  </UModal>
</template>

<style scoped lang="scss">

</style>
