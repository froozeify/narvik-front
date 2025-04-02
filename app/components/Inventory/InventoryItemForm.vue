<script setup lang="ts">
import type {PropType, Ref} from "vue";
import type {InventoryItem} from "~/types/api/item/clubDependent/plugin/sale/inventoryItem";
import InventoryItemQuery from "~/composables/api/query/clubDependent/plugin/sale/InventoryItemQuery";
import type {InventoryCategory} from "~/types/api/item/clubDependent/plugin/sale/inventoryCategory";
import InventoryCategoryQuery from "~/composables/api/query/clubDependent/plugin/sale/InventoryCategoryQuery";
import type {FormError, FormErrorEvent} from "#ui/types";

const props = defineProps({
  item: {
    type: Object as PropType<InventoryItem>,
    required: false,
  },
  categories: {
    type: Object as PropType<InventoryCategory[]>,
    required: false,
  },
  viewOnly: {
    type: Boolean,
    required: false,
    default: false
  }
})

const item: Ref<InventoryItem> = props.item ? ref(props.item) : ref(getDefaultInventoryItem())
const categories: Ref<InventoryCategory[] | undefined> = ref(props.categories)

watch(props, async value => {
  item.value = props.item ?? getDefaultInventoryItem()
  if (!props.categories) {
    await getCategories()
  }
})

const emit = defineEmits([
  'updated',
])

const isUpdating = ref(false)

const toast = useToast()
const inventoryItemQuery = new InventoryItemQuery()
const inventoryCategoryQuery = new InventoryCategoryQuery()

const items = computed( () => {
  const items: SelectItem[] = []
  categories.value?.forEach(value => {
    items.push({
      label: value.name,
      value: value
    })
  })
  return items;
})

function getDefaultInventoryItem() {
  const item: InventoryItem = {
    id: undefined,
    canBeSold: true,
    sellingQuantity: 1
  }
  return item
}

// Form validation

const validate = (state: any): FormError[] => {
  const errors = []
  if (!state.name) errors.push({ path: 'name', message: 'Champ requis' })
  if (!state.sellingPrice) errors.push({ path: 'sellingPrice', message: 'Champ requis' })
  return errors
}

async function onError(event: FormErrorEvent) {
  const element = document.getElementById(event.errors[0].id)
  element?.focus()
  element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

// Camera detection setup

const cameraPreview = ref(false)
const cameraIsPresent = verifyCameraIsPresent()

function onDecoded(value: string) {
  item.value.barcode = value
}

// Api Query

async function updateItem() {
  isUpdating.value = true
  const isCreate = !item.value.uuid

  if (item.value.category) {
    item.value.category = item.value.category["@id"]
  } else {
    item.value.category = null
  }

  if (Number.isNaN(item.value.quantity) || item.value.quantity?.toString() == '') {
    item.value.quantity = null
  }
  if (Number.isNaN(item.value.quantityAlert) || item.value.quantityAlert?.toString() == '') {
    item.value.quantityAlert = null
  }
  if (Number.isNaN(item.value.sellingQuantity) || item.value.sellingQuantity?.toString() == '') {
    item.value.sellingQuantity = 1
  }

  let errorMessage = null
  if (isCreate) {
    const { created, error } = await inventoryItemQuery.post(item.value)
    if (created) {
      item.value = created
    }

    if (error) {
      errorMessage = error.message
    }
  } else {
    const { updated, error } = await inventoryItemQuery.patch(item.value, item.value)
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

if (!categories.value) {
  getCategories()
}
async function getCategories() {
  const { items } = await inventoryCategoryQuery.getAll();
  categories.value = items.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1))
}

</script>

<template>
  <UForm class="flex gap-2 flex-col" :state="item" :validate="validate" @submit="updateItem" @error="onError">
    <UFormField label="Peut être vendu">
      <USwitch v-model="item.canBeSold" :disabled="props.viewOnly" />
    </UFormField>

    <UFormField label="Catégorie">
      <USelectMenu
        v-model="item.category"
        :items="items"
        :class="props.viewOnly ? 'pointer-events-none' : ''"
        :tabindex="props.viewOnly ? '-1' : '0'"
        :ui="{ icon: { trailing: { pointer: '' } } }"
      >
        <template #label>
          <span v-if="item.category">
            {{ item.category.name }}
          </span>
          <span v-else><i>Aucune catégorie</i></span>
        </template>

        <template #trailing v-if="!props.viewOnly && item.category">
          <UIcon
            class="cursor-pointer"
            name="i-heroicons-x-mark"
            @click="item.category = null"
          />
        </template>
      </USelectMenu>
    </UFormField>

    <UFormField label="Nom" name="name">
      <UInput v-model="item.name" :class="props.viewOnly ? 'pointer-events-none' : ''" :tabindex="props.viewOnly ? '-1' : '0'" />
    </UFormField>

    <UFormField label="Description">
      <UInput v-model="item.description" :class="props.viewOnly ? 'pointer-events-none' : ''" :tabindex="props.viewOnly ? '-1' : '0'" />
    </UFormField>

    <UFormField v-if="!props.viewOnly || item.barcode" label="Code barre">
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
    </UFormField>

    <UFormField label="Prix d'achat">
      <UInput v-model="item.purchasePrice" :class="props.viewOnly ? 'pointer-events-none' : ''" :tabindex="props.viewOnly ? '-1' : '0'">
        <template #trailing>
          <span class="text-gray-500 dark:text-gray-400 text-xs">EUR</span>
        </template>
      </UInput>
    </UFormField>

    <UFormField label="Prix de vente" name="sellingPrice">
      <UInput v-model="item.sellingPrice" :class="props.viewOnly ? 'pointer-events-none' : ''" :tabindex="props.viewOnly ? '-1' : '0'">
        <template #trailing>
          <span class="text-gray-500 dark:text-gray-400 text-xs">EUR</span>
        </template>
      </UInput>
    </UFormField>

    <UFormField label="Vendue par (quantité)">
      <UInput v-model="item.sellingQuantity" type="number" :class="props.viewOnly ? 'pointer-events-none' : ''" :tabindex="props.viewOnly ? '-1' : '0'" />
    </UFormField>

    <UFormField label="Quantité en stock">
      <UInput v-model="item.quantity" type="number" :class="props.viewOnly ? 'pointer-events-none' : ''" :tabindex="props.viewOnly ? '-1' : '0'" />
    </UFormField>

    <UFormField label="Alerte quantité en stock critique">
      <UInput v-model="item.quantityAlert" type="number" :class="props.viewOnly ? 'pointer-events-none' : ''" :tabindex="props.viewOnly ? '-1' : '0'" />
    </UFormField>

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
