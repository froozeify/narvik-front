<script setup lang="ts">

import type {PropType} from "vue";
import type {Sale} from "~/types/api/item/sale";
import type {FormError} from "#ui/types";
import SaleQuery from "~/composables/api/query/SaleQuery";
import {formatDateTimeReadable} from "~/utils/date";
import {useSelfMemberStore} from "~/stores/useSelfMember";
import {useSaleStore} from "~/stores/useSaleStore";

const props = defineProps(
  {
    sale: {
      type: Object as PropType<Sale>,
      required: true
    }
  }
)

const toast = useToast()
const modal = useModal()

const selfStore = useSelfMemberStore();
const saleStore = useSaleStore()
const isAdmin = selfStore.isAdmin();

const isLoading = ref(false)

const saleQuery = new SaleQuery()
const sale: Sale = {...props.sale}

const validate = (state: any): FormError[] => {
  const errors = []
  if (!state.createdAt) errors.push({ path: 'createdAt', message: 'Champ requis' })
  return errors
}

async function updateSale() {
  if (!sale.createdAt) {
    toast.add({
      color: "red",
      title: "La date doit être définie",
    });
  }

  if (!sale.createdAt || !props.sale) return;

  const payload: Sale = {
    comment: sale.comment,
    createdAt: sale.createdAt
  }

  if (payload.comment?.trim().length === 0) {
    payload.comment = null
  }

  isLoading.value = true
  const { updated, error } = await saleQuery.patch(sale, payload)
  isLoading.value = false

  if (error || !updated) {
    toast.add({
      color: "red",
      title: "L'enregistrement a échoué",
      description: error?.message
    });
    return;
  }

  // We update the sale with the api update item
  props.sale.createdAt = updated.createdAt
  props.sale.comment = updated.comment

  toast.add({
    color: "green",
    title: "Vente modifiée"
  });

  // We trigger a refresh of the listing
  saleStore.shouldRefreshSales = true

  await modal.close()
}

</script>

<template>
  <ModalWithActions title="Modification de la vente">

    <UForm class="flex gap-2 flex-col" :state="sale" :validate="validate">

      <UFormGroup
        v-if="isAdmin"
        label="Date"
        name="createdAt"
      >
        <UPopover :popper="{ placement: 'bottom-start' }">
          <UButton icon="i-heroicons-calendar-days-20-solid" :label="formatDateTimeReadable(sale.createdAt) || 'Choisir une date'" />

          <template #panel="{ close }">
            <GenericDatePicker v-model="sale.createdAt" mode="dateTime" />
          </template>
        </UPopover>
      </UFormGroup>

      <UFormGroup label="Commentaire" name="comment">
        <UTextarea v-model="sale.comment" :rows="2" autoresize :maxrows="3" placeholder="Commentaire liée à la vente" />
      </UFormGroup>
    </UForm>

    <template #actions>
      <UButton
        color="yellow"
        :loading="isLoading"
        @click="updateSale()"
      >
        Modifier
      </UButton>
    </template>
  </ModalWithActions>
</template>

<style scoped lang="scss">

</style>
