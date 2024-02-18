<script setup lang="ts">
import type {PropType} from "vue";
import type {MemberPresence} from "~/types/memberpresence";
import clipboard from "clipboardy";
import RegisterMemberPresence from "~/components/PresentMember/RegisterMemberPresence.vue";
import type {Image} from "~/types/image";
import ImageQuery from "~/composables/api/query/ImageQuery";
import MemberQuery from "~/composables/api/query/MemberQuery";
import type {Member} from "~/types/member";
import {formatDateReadable} from "~/utils/date";
import {useSelfMemberStore} from "~/stores/useSelfMember";

const toast = useToast()
const selfStore = useSelfMemberStore();

const props = defineProps({
  item: {
    type: Object as PropType<MemberPresence>,
    required: true
  },
});

const emit = defineEmits([
  'updated',
])

const imageQuery = new ImageQuery()
const memberQuery = new MemberQuery()

const memberPresence: Ref<MemberPresence> = ref(props.item)
const member: Ref<Member | undefined> = ref(undefined)

const memberProfileImage: Ref<Image|undefined> = ref(undefined)

const updateMemberPresenceModalOpen = ref(false);

if (memberPresence.value && memberPresence.value.member?.id) {
  // We request the real member datas
  memberQuery.get(memberPresence.value.member.id).then(memberResponse => {
    if (memberResponse.retrieved.value && memberResponse.retrieved.value.profileImage) {
      member.value = memberResponse.retrieved.value

      imageQuery.get(memberResponse.retrieved.value.profileImage).then(profileImage => {
        if (profileImage.retrieved) {
          memberProfileImage.value = profileImage.retrieved.value
        }
      })
    }
  })
}


function presenceUpdated(newMemberPresence: MemberPresence) {
  updateMemberPresenceModalOpen.value = false;
  memberPresence.value = newMemberPresence
  emit('updated', newMemberPresence)
}

async function copyLicence() {
  if (selfStore.isAdmin() && props.item.member?.licence) {
    clipboard.write(props.item.member.licence)
    toast.add({
      title: 'Licence copiée',
      color: "green"
    })
  }
}

</script>

<template>
  <UCard v-if="member">
    <div class="flex justify-end">
      <UTooltip text="Editer" class="">
        <UButton
            @click="updateMemberPresenceModalOpen = true"
            icon="i-heroicons-pencil-square"
            size="xs"
            variant="ghost"
        />
      </UTooltip>
    </div>

    <div class="mx-auto my-0 h-24 w-24 aspect-square">
      <img class="rounded-full w-full h-full object-contain bg-gray-100 dark:bg-gray-800" v-if="memberProfileImage" :src="memberProfileImage.base64" />
      <USkeleton v-else class="w-full h-full" :ui="{ rounded: 'rounded-full' }"/>
    </div>

    <div class="space-y-4 w-full mt-4">
      <div class="text-center text-2xl font-bold">
        {{ member.fullName }}
      </div>
      <div class="text-center text-xl cursor-pointer select-none" @click="copyLicence">
        {{ member.licence }}
      </div>
      <div v-if="member.lastControlShooting" class="text-center text-xl">
        Dernier tir de contrôle : {{ formatDateReadable(member.lastControlShooting) }}
      </div>
      <div class="flex gap-4 justify-center flex-wrap">
        <UButton
            v-for="activity in memberPresence?.activities.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1))"
            variant="soft"
            :ui="{ rounded: 'rounded-full' }"
        >
          {{ activity.name }}
        </UButton>
      </div>

    </div>
  </UCard>

  <UCard v-else>
    <div class="flex justify-end">
      <UTooltip text="Editer" class="">
        <UButton
            @click="updateMemberPresenceModalOpen = true"
            icon="i-heroicons-pencil-square"
            size="xs"
            variant="ghost"
        />
      </UTooltip>
    </div>

    <div class="mx-auto my-0 h-24 w-24 aspect-square">
      <USkeleton class="w-full h-full" :ui="{ rounded: 'rounded-full' }"/>
    </div>

    <div class="space-y-4 w-full mt-4">
      <div v-for="w in ['w-52 h-8', 'w-36 h-4', 'w-48 h-4']" class="flex justify-center">
        <USkeleton :class="w" />
      </div>
      <div class="flex gap-4 justify-center flex-wrap">
        <USkeleton v-for="i in (Math.floor(Math.random()*6) + 2)" class="w-14 h-4" />
      </div>

    </div>
  </UCard>

  <UModal
      v-model="updateMemberPresenceModalOpen">
    <RegisterMemberPresence
      :member-presence="memberPresence"
      @registered="presenceUpdated"
      @canceled="updateMemberPresenceModalOpen = false"
    />
  </UModal>
</template>

<style scoped lang="scss">

</style>
