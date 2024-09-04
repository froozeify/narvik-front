<script setup lang="ts">
import type {PropType} from "vue";
import type {ExternalPresence} from "~/types/api/item/externalPresence";
import RegisterExternalPresence from "~/components/ExternalPresence/RegisterExternalPresence.vue";
import ExternalPresenceQuery from "~/composables/api/query/ExternalPresenceQuery";

const toast = useToast()

const props = defineProps({
  item: {
    type: Object as PropType<ExternalPresence>,
    required: true
  },
});

const emit = defineEmits([
  'updated',
  'canceled'
])

const selfStore = useSelfMemberStore()
const isSupervisor = selfStore.hasSupervisorRole()
const isBadger = selfStore.isBadger()

const externalPresence: Ref<ExternalPresence> = ref(props.item)
const externalPresenceQuery = new ExternalPresenceQuery()

const updateExternalPresenceModalOpen = ref(false);

function presenceUpdated(newExternalPresence: ExternalPresence) {
  updateExternalPresenceModalOpen.value = false;
  externalPresence.value = newExternalPresence
  emit('updated', newExternalPresence)
}

function presenceCanceled(newExternalPresence: ExternalPresence) {
  updateExternalPresenceModalOpen.value = false;
  emit('canceled', newExternalPresence)
}

async function deletePresence(close: Function) {
  if (isSupervisor || isBadger) {
    await externalPresenceQuery.delete(externalPresence.value)
    close()
    emit('updated', null)
  }
}

</script>

<template>
  <UCard class="bg-orange-50 dark:bg-orange-950">
    <div class="flex gap-2">
      <UButton
        @click="emit('canceled')"
        icon="i-heroicons-x-circle"
        color="orange"
        variant="ghost"
        size="xs"
      />

      <div class="flex-1"></div>

      <UButton
          @click="updateExternalPresenceModalOpen = true"
          icon="i-heroicons-pencil-square"
          size="xs"
          color="orange"
          variant="solid"
          label="Editer"
      />

      <UTooltip text="Supprimer" v-if="isSupervisor || isBadger">
        <UPopover>
          <UButton
              icon="i-heroicons-trash"
              size="xs"
              color="red"
              variant="ghost"
          />

          <template #panel="{ close }">
            <div class="p-4 w-56 flex flex-col gap-4">
              <div class="text-center text-lg font-bold">Êtes-vous certain ?</div>

              <UButton
                  @click="deletePresence(close);"
                  color="red"
                  class="mx-auto"
              >
                Supprimer
              </UButton>
            </div>
          </template>
        </UPopover>
      </UTooltip>
    </div>

    <div class="space-y-4 w-full mt-4">
      <div class="text-center text-2xl font-bold">
        {{ externalPresence.fullName }}
      </div>
      <div class="flex items-center justify-center text-xl">
        <UIcon class="mr-2" name="i-heroicons-identification" />
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
      @canceled="presenceCanceled"
    />
  </UModal>
</template>

<style scoped lang="scss">

</style>
