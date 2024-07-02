<script setup lang="ts">
import type {PropType} from "vue";
import type {Inventoryitem} from "~/types/inventoryitem";
import InventoryItemQuery from "~/composables/api/query/InventoryItemQuery";

const props = defineProps({
  item: {
    type: Object as PropType<Inventoryitem>,
    required: false
  },
  viewOnly: {
    type: Boolean,
    required: false,
    default: false
  }
})

const item: Inventoryitem = props.item ?? {}

const emit = defineEmits([
  'updated',
])

const toast = useToast()

const inventoryItemQuery = new InventoryItemQuery()

const isUpdating = ref(false)

</script>

<template>
  <div class="flex gap-2 flex-col">
    <UFormGroup label="Peut être vendu">
      <UToggle :model-value="item.canBeSold" :disabled="props.viewOnly" />
    </UFormGroup>

    <UFormGroup v-if="item.barcode !== undefined" label="Code barre">
      <UInput :model-value="item.barcode" :class="props.viewOnly ? 'pointer-events-none' : ''" :tabindex="props.viewOnly ? '-1' : '0'" />
    </UFormGroup>

    <UFormGroup
      v-for="(value, key) in {
                'Nom': item.name,
                'Description': item.description,
                'Prix d\'achat': item.purchasePrice,
                'Prix de vente': item.sellingPrice,
                'Vendue par': item.sellingQuantity,
                'Quantité en stock': item.quantity
              }"
      :label="key"
    >
      <UInput :model-value="value" :class="props.viewOnly ? 'pointer-events-none' : ''" :tabindex="props.viewOnly ? '-1' : '0'" />
    </UFormGroup>

    <UButton
      class="mt-2"
      block
    >
      <template v-if="item.id">
        Modifier
      </template>
      <template v-else>
        Créer
      </template>
    </UButton>
  </div>
</template>

<style scoped lang="scss">

</style>
