<script setup lang="ts">

import type {PropType} from "vue";
import type {FormError} from "#ui/types";
import {useSelfUserStore} from "~/stores/useSelfUser";
import type {Member} from "~/types/api/item/clubDependent/member";
import MemberQuery from "~/composables/api/query/clubDependent/MemberQuery";

const props = defineProps(
  {
    member: {
      type: Object as PropType<Member>,
      required: true
    }
  }
)

const emit = defineEmits(['updated'])

const toast = useToast()
const modal = useModal()


const isLoading = ref(false)

const memberQuery = new MemberQuery()
const member: Member = {...props.member}

const validate = (state: any): FormError[] => {
  const errors = []
  if (!state.email) errors.push({ path: 'email', message: 'Champ requis' })
  return errors
}

async function updateLink() {
  if (!member.linkedEmail) return;

  isLoading.value = true
  const { updated, error } = await memberQuery.linkWithUser(member, member.linkedEmail)
  isLoading.value = false

  if (error || !updated) {
    toast.add({
      color: "red",
      title: "L'enregistrement a échoué",
      description: error?.message
    });
    return;
  }

  toast.add({
    color: "green",
    title: "Liaison modifiée"
  });

  emit('updated')
  await modal.close()
}

</script>

<template>
  <ModalWithActions title="Changement du compte lié">

    <UForm class="flex gap-2 flex-col" :state="member" :validate="validate">

      <UFormGroup label="Adresse mail du compte" name="email">
        <UInput v-model="member.linkedEmail" placeholder="Email" />
      </UFormGroup>
    </UForm>

    <template #actions>
      <UButton
        color="yellow"
        :loading="isLoading"
        @click="updateLink()"
      >
        Modifier
      </UButton>
    </template>
  </ModalWithActions>
</template>

<style scoped lang="scss">

</style>
