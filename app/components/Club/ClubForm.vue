<script setup lang="ts">
import type {PropType, Ref} from "vue";
import type {FormError, FormErrorEvent} from "#ui/types";
import ClubQuery from "~/composables/api/query/ClubQuery";
import type {WriteClub} from "~/types/api/item/club";
import {formatDateReadable} from "~/utils/date";

const props = defineProps({
  item: {
    type: Object as PropType<WriteClub>,
    required: false,
  },
  isList: {
    type: Boolean,
    required: false,
    default: false
  }
})

const item: Ref<WriteClub> = props.item ? ref(props.item) : ref(getDefaultItem())

watch(props, async value => {
  item.value = props.item ?? getDefaultItem()
})

const emit = defineEmits([
  'updated',
])

const isUpdating = ref(false)

const toast = useToast()
const clubQuery = new ClubQuery()

function getDefaultItem() {
  const item: WriteClub = {
    uuid: undefined,
    name: '',
    isActivated: true,
    presencesEnabled: false,
    salesEnabled: false,
  }
  return item
}

// Form validation
const validate = (state: any): FormError[] => {
  const errors = []
  if (!state.name) errors.push({ name: 'name', message: 'Champ requis' })
  return errors
}
async function onError(event: FormErrorEvent) {
  const element = document.getElementById(event.errors[0].id)
  element?.focus()
  element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

// Api Query

async function submitItem() {
  isUpdating.value = true
  const isCreate = !item.value.uuid

  // We recreate the payload so we don't edit the settings, badgerToken, ...
  let payload: WriteClub = {
    name: item.value.name,
    renewDate: item.value.renewDate ?? null,
    presencesEnabled: item.value.presencesEnabled,
    salesEnabled: item.value.salesEnabled,
    isActivated: item.value.isActivated,
    address: item.value.address,
    zipCode: Number(item.value.zipCode) ?? null,
    city: item.value.city,
    siret: item.value.siret,
    vat: item.value.vat,
    comment: item.value.comment,
    website: item.value.website,
    contactName: item.value.contactName,
    contactEmail: item.value.contactEmail,
    contactPhone: item.value.contactPhone
  }

  let errorMessage = null
  if (isCreate) {
    const { created, error } = await clubQuery.post(payload)
    if (created) {
      item.value = created
    }

    if (error) {
      errorMessage = error.message
    }
  } else {
    const { updated, error } = await clubQuery.patch(item.value, payload)
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
      color: "error"
    })
    return
  }

  console.log('Ok')
  emit('updated')
}

</script>

<template>
  <UForm :state="item" :validate="validate" @submit="submitItem" @error="onError">
    <div class="flex gap-2 flex-col relative">
      <UFormField label="Date de renouvellement" name="renewDate">
        {{ formatDateReadable(item.renewDate?.toString()) || 'Non défini' }}
      </UFormField>
      <UFormField v-if="item.deletionDate" label="Date de suppression" name="deletionDate">
        {{ formatDateReadable(item.deletionDate.toString()) }}
      </UFormField>
      <UFormField label="Activé" name="isActivated">
        <USwitch v-model="item.isActivated" :class="props.isList && item.uuid ? 'pointer-events-none' : ''" :tabindex="props.isList && item.uuid ? '-1' : '0'" />
      </UFormField>
      <UFormField label="Nom" name="name" required>
        <UInput v-model="item.name" :class="props.isList && item.uuid ? 'pointer-events-none' : ''" :tabindex="props.isList && item.uuid ? '-1' : '0'"/>
      </UFormField>
      <UFormField label="Commentaire" :error="item.comment ? (item.comment.length > 249 && 'Longueur maximum atteinte (250)') : ''">
        <UTextarea v-model="item.comment" :rows="2" autoresize :maxrows="3" placeholder="Commentaire" :class="props.isList && item.uuid ? 'pointer-events-none' : ''" :tabindex="props.isList && item.uuid ? '-1' : '0'"/>
      </UFormField>

      <USeparator label="Modules" />

      <div class="grid grid-cols-1 md:grid-cols-2">
        <UFormField label="Présences" name="presencesEnabled">
          <USwitch v-model="item.presencesEnabled" :class="props.isList && item.uuid ? 'pointer-events-none' : ''" :tabindex="props.isList && item.uuid ? '-1' : '0'"/>
        </UFormField>
        <UFormField label="Vente" name="salesEnabled">
          <USwitch v-model="item.salesEnabled" :class="props.isList && item.uuid ? 'pointer-events-none' : ''" :tabindex="props.isList && item.uuid ? '-1' : '0'"/>
        </UFormField>
      </div>

      <USeparator label="Contact" />

      <UFormField label="Nom" name="contactName">
        <UInput v-model="item.contactName" :class="props.isList && item.uuid ? 'pointer-events-none' : ''" :tabindex="props.isList && item.uuid ? '-1' : '0'"/>
      </UFormField>
      <UFormField label="Email" name="contactEmail">
        <UInput v-model="item.contactEmail" type="email" :class="props.isList && item.uuid ? 'pointer-events-none' : ''" :tabindex="props.isList && item.uuid ? '-1' : '0'"/>
      </UFormField>
      <UFormField label="Téléphone" name="contactPhone">
        <UInput v-model="item.contactPhone" type="tel" :class="props.isList && item.uuid ? 'pointer-events-none' : ''" :tabindex="props.isList && item.uuid ? '-1' : '0'"/>
      </UFormField>
      <UFormField label="Site" name="website">
        <UInput v-model="item.website" type="url" :class="props.isList && item.uuid ? 'pointer-events-none' : ''" :tabindex="props.isList && item.uuid ? '-1' : '0'"/>
      </UFormField>

      <USeparator label="Facturation" />

      <UFormField label="Adresse" name="address">
        <UInput v-model="item.address" :class="props.isList && item.uuid ? 'pointer-events-none' : ''" :tabindex="props.isList && item.uuid ? '-1' : '0'"/>
      </UFormField>
      <div class="grid grid-cols-2 gap-2">
        <UFormField label="Code postal" name="zipCode">
          <UInput v-model="item.zipCode" :class="props.isList && item.uuid ? 'pointer-events-none' : ''" :tabindex="props.isList && item.uuid ? '-1' : '0'"/>
        </UFormField>
        <UFormField label="Ville" name="city">
          <UInput v-model="item.city" :class="props.isList && item.uuid ? 'pointer-events-none' : ''" :tabindex="props.isList && item.uuid ? '-1' : '0'"/>
        </UFormField>
      </div>
      <UFormField label="Siret" name="siret">
        <UInput v-model="item.siret" :class="props.isList && item.uuid ? 'pointer-events-none' : ''" :tabindex="props.isList && item.uuid ? '-1' : '0'"/>
      </UFormField>
      <UFormField label="TVA" name="vat">
        <UInput v-model="item.vat" :class="props.isList && item.uuid ? 'pointer-events-none' : ''" :tabindex="props.isList && item.uuid ? '-1' : '0'"/>
      </UFormField>

      <GenericItemTimestampInfo :item="item" />
    </div>

    <UButton type="submit" v-if="!props.isList || !item.uuid"
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

<style scoped lang="css">

</style>
