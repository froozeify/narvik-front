<script setup lang="ts">
import type {PropType, Ref} from "vue";
import ClubQuery from "~/composables/api/query/ClubQuery";
import type {SelfWriteClub} from "~/types/api/item/club";

const props = defineProps({
  item: {
    type: Object as PropType<SelfWriteClub>,
    required: true,
  }
})

const item: Ref<SelfWriteClub> = ref(props.item)

const emit = defineEmits([
  'updated',
])

const isUpdating = ref(false)

const clubQuery = new ClubQuery()


// Api Query

async function submitItem() {
  isUpdating.value = true
  let payload: SelfWriteClub = {
    address: item.value.address,
    zipCode: Number(item.value.zipCode) ?? null,
    city: item.value.city,
    siret: item.value.siret,
    vat: item.value.vat,
    website: item.value.website,
    contactName: item.value.contactName,
    contactEmail: item.value.contactEmail,
    contactPhone: item.value.contactPhone
  }

  const { updated, error } = await clubQuery.patch(item.value, payload)
  if (updated) {
    item.value = updated
  }

  isUpdating.value = false

  if (error) {
    displayApiError(error)
    return
  }

  emit('updated')
}

</script>

<template>
  <UForm :state="item" @submit="submitItem">
    <div class="flex gap-2 flex-col relative">
      <UFormField label="Site" name="website">
        <UInput v-model="item.website" type="url" />
      </UFormField>

      <USeparator label="Contact" />

      <UFormField label="Nom" name="contactName">
        <UInput v-model="item.contactName" />
      </UFormField>
      <UFormField label="Email" name="contactEmail" required>
        <UInput v-model="item.contactEmail" type="email" required/>
      </UFormField>
      <UFormField label="Téléphone" name="contactPhone">
        <UInput v-model="item.contactPhone" type="tel"/>
      </UFormField>

      <USeparator label="Facturation" />
      <UFormField label="Nom" description="Veuillez contacter le support pour modifier le nom.">
        <UInput :model-value="item.name" disabled />
      </UFormField>

      <UFormField label="Adresse" name="address" required>
        <UInput v-model="item.address" required/>
      </UFormField>
      <div class="grid grid-cols-2 gap-2">
        <UFormField label="Code postal" name="zipCode" required>
          <UInput v-model="item.zipCode" required/>
        </UFormField>
        <UFormField label="Ville" name="city" required>
          <UInput v-model="item.city" required/>
        </UFormField>
      </div>
      <UFormField label="Siret" name="siret">
        <UInput v-model="item.siret" />
      </UFormField>
      <UFormField label="TVA" name="vat">
        <UInput v-model="item.vat" />
      </UFormField>
    </div>

    <UButton
      type="submit"
      block
      class="mt-2"
      :loading="isUpdating"
    >
      Modifier
    </UButton>
  </UForm>
</template>

<style scoped lang="css">

</style>
