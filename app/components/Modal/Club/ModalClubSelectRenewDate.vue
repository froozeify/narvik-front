<script setup lang="ts">

import type {PropType} from "vue";
import type {WriteClub} from "~/types/api/item/club";
import dayjs from "dayjs";

const props = defineProps({
  item: {
    type: Object as PropType<WriteClub>,
    required: true
  }
});

const emit = defineEmits(['selected'])

const selectedDate: Ref<Date|undefined> = ref(props.item.renewDate ? dayjs(props.item.renewDate).toDate() : undefined)

function applyProfile() {
  emit('selected', selectedDate.value)
  useModal().close()
}

</script>

<template>
  <ModalWithActions title="Choix de la date de renouvelement">

    <slot>
      <div class="flex flex-col justify-center gap-4">
        <div class="flex justify-center gap-4">
          <UButton @click="selectedDate = dayjs(selectedDate).add(1, 'months').toDate(); applyProfile()">+1 mois</UButton>
          <UButton @click="selectedDate = dayjs(selectedDate).add(1, 'years').toDate(); applyProfile()">+1 an</UButton>
          <UButton color="red" variant="ghost" @click="selectedDate = undefined; applyProfile()">Pas de renouvellement</UButton>
        </div>
        <div class="text-center">
          <GenericDatePicker v-model="selectedDate" mode="date" />
        </div>
      </div>
    </slot>

    <template #actions>
      <UButton
        @click="applyProfile"
      >
        Modifier
      </UButton>
    </template>
  </ModalWithActions>
</template>

<style scoped lang="css">

</style>
