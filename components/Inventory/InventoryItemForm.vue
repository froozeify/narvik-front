<script setup lang="ts">
import type {PropType, Ref} from "vue";
import type {Inventoryitem} from "~/types/inventoryitem";
import InventoryItemQuery from "~/composables/api/query/InventoryItemQuery";

const props = defineProps({
  item: {
    type: Object as PropType<Inventoryitem>,
    required: false,
    default: { canBeSold: true, sellingQuantity: 1}
  },
  viewOnly: {
    type: Boolean,
    required: false,
    default: false
  }
})

const item: Ref<Inventoryitem> = ref(props.item)
watch(props, value => {
  item.value = props.item
})

const emit = defineEmits([
  'updated',
])

const isUpdating = ref(false)

const toast = useToast()
const inventoryItemQuery = new InventoryItemQuery()

// Camera detection setup

const cameraPreview = ref(false)
const cameraIsPresent = verifyCameraIsPresent()

function onDecoded(value: string) {
  item.value.barcode = value
}

// Api Query

async function updateItem() {
  isUpdating.value = true
  const isCreate = !item.value.id

  // We unset some field we never want to send to the api
  item.value.category = undefined //TODO: Add category selector

  let errorMessage = null
  if (isCreate) {
    const { error } = await inventoryItemQuery.post(item.value)
    if (error) {
      errorMessage = error.message
    }
  } else {
    const { error } = await inventoryItemQuery.patch(item.value, item.value)
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
  <div class="flex gap-2 flex-col">
    <UFormGroup label="Peut être vendu">
      <UToggle v-model="item.canBeSold" :disabled="props.viewOnly" />
    </UFormGroup>


    <UFormGroup v-if="!props.viewOnly || item.barcode" label="Code barre">
      <GenericBarcodeReader
        class="mb-2"
        v-model="cameraPreview"
        @decoded="onDecoded"
      />
      <UInput
        v-model="item.barcode"
        :class="props.viewOnly ? 'pointer-events-none' : ''"
        :tabindex="props.viewOnly ? '-1' : '0'"
        :ui="{ icon: { trailing: { pointer: '' } } }"
      >
        <template #trailing v-if="cameraIsPresent">
          <UIcon
            class="cursor-pointer"
            name="i-heroicons-qr-code"
            @click="cameraPreview = true"
          />
        </template>
      </UInput>
    </UFormGroup>

    <UFormGroup label="Nom">
      <UInput v-model="item.name" :class="props.viewOnly ? 'pointer-events-none' : ''" :tabindex="props.viewOnly ? '-1' : '0'" />
    </UFormGroup>

    <UFormGroup label="Description">
      <UInput v-model="item.description" :class="props.viewOnly ? 'pointer-events-none' : ''" :tabindex="props.viewOnly ? '-1' : '0'" />
    </UFormGroup>

    <UFormGroup label="Prix d'achat">
      <UInput v-model="item.purchasePrice" :class="props.viewOnly ? 'pointer-events-none' : ''" :tabindex="props.viewOnly ? '-1' : '0'" />
    </UFormGroup>

    <UFormGroup label="Prix de vente">
      <UInput v-model="item.sellingPrice" :class="props.viewOnly ? 'pointer-events-none' : ''" :tabindex="props.viewOnly ? '-1' : '0'" />
    </UFormGroup>

    <UFormGroup label="Vendue par (quantité)">
      <UInput v-model="item.sellingQuantity" type="number" :class="props.viewOnly ? 'pointer-events-none' : ''" :tabindex="props.viewOnly ? '-1' : '0'" />
    </UFormGroup>

    <UFormGroup label="Quantité en stock">
      <UInput v-model="item.quantity" type="number" :class="props.viewOnly ? 'pointer-events-none' : ''" :tabindex="props.viewOnly ? '-1' : '0'" />
    </UFormGroup>

    <UButton v-if="!props.viewOnly"
      block
      class="mt-2"
      :loading="isUpdating"
      @click="updateItem()"
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
