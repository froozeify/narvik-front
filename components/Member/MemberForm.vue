<script setup lang="ts">
import type {PropType, Ref} from "vue";
import type {InventoryItem} from "~/types/api/item/clubDependent/plugin/sale/inventoryItem";
import InventoryItemQuery from "~/composables/api/query/clubDependent/plugin/sale/InventoryItemQuery";
import type {InventoryCategory} from "~/types/api/item/clubDependent/plugin/sale/inventoryCategory";
import InventoryCategoryQuery from "~/composables/api/query/clubDependent/plugin/sale/InventoryCategoryQuery";
import type {FormError, FormErrorEvent} from "#ui/types";
import type {Member} from "~/types/api/item/clubDependent/member";
import type {Season} from "~/types/api/item/season";
import SeasonQuery from "~/composables/api/query/SeasonQuery";
import MemberQuery from "~/composables/api/query/clubDependent/MemberQuery";

const props = defineProps({
  item: {
    type: Object as PropType<Member>,
    required: false,
  },
  seasons: {
    type: Object as PropType<Season[]>,
    required: false,
  },
  viewOnly: {
    type: Boolean,
    required: false,
    default: false
  }
})

const item: Ref<Member> = props.item ? ref(props.item) : ref(getDefaultItem())

watch(props, async value => {
  item.value = props.item ?? getDefaultItem()
})

const emit = defineEmits([
  'updated',
])

const isUpdating = ref(false)

const toast = useToast()
const memberQuery = new MemberQuery()

function getDefaultItem() {
  const item: Member = {
    uuid: undefined,
  }
  return item
}

// Form validation

const validate = (state: Member): FormError[] => {
  const errors = []

  if (!state.firstname) errors.push({ path: 'firstname', message: 'Champ requis' })
  if (!state.lastname) errors.push({ path: 'lastname', message: 'Champ requis' })
  if (!state.email) errors.push({ path: 'email', message: 'Champ requis' })

  return errors
}

async function onError(event: FormErrorEvent) {
  const element = document.getElementById(event.errors[0].id)
  element?.focus()
  element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

// Api Query

async function updateItem() {
  isUpdating.value = true
  const isCreate = !item.value.uuid

  let errorMessage = null
  if (isCreate) {
    const { created, error } = await memberQuery.post(item.value)
    if (created) {
      item.value = created
    }

    if (error) {
      errorMessage = error.message
    }
  } else {
    const { updated, error } = await memberQuery.patch(item.value, item.value)
    if (updated) {
      item.value = updated
    }
    if (error) {
      errorMessage = error.message
    }
  }

  isUpdating.value = false

  if (errorMessage) {
    toast.add({
      title: "Une erreur est survenue",
      description: errorMessage,
      color: "red"
    })
    return
  }

  emit('updated', item.value)
}

</script>

<template>
  <UForm class="flex gap-2 flex-col" :state="item" :validate="validate" @submit="updateItem" @error="onError">
    <UFormGroup label="Nom" name="lastname">
      <UInput v-model="item.lastname" :class="props.viewOnly ? 'pointer-events-none' : ''" :tabindex="props.viewOnly ? '-1' : '0'" />
    </UFormGroup>

    <UFormGroup label="Prénom" name="firstname">
      <UInput v-model="item.firstname" :class="props.viewOnly ? 'pointer-events-none' : ''" :tabindex="props.viewOnly ? '-1' : '0'" />
    </UFormGroup>

    <UFormGroup label="Email" name="email">
      <UInput v-model="item.email" type="email" :class="props.viewOnly ? 'pointer-events-none' : ''" :tabindex="props.viewOnly ? '-1' : '0'" />
    </UFormGroup>

    <UButton type="submit" v-if="!props.viewOnly"
      block
      class="mt-2"
      :loading="isUpdating"
    >
      <template v-if="item.uuid">
        Modifier
      </template>
      <template v-else>
        Créer
      </template>
    </UButton>
  </UForm>
</template>

<style scoped lang="scss">

</style>
