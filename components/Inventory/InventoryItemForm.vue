<script setup lang="ts">
import type {PropType, Ref} from "vue";
import type {InventoryItem} from "~/types/inventoryItem";
import InventoryItemQuery from "~/composables/api/query/InventoryItemQuery";
import type {InventoryCategory} from "~/types/inventorycategory";
import InventoryCategoryQuery from "~/composables/api/query/InventoryCategoryQuery";

const props = defineProps({
  item: {
    type: Object as PropType<InventoryItem>,
    required: false,
    default: { canBeSold: true, sellingQuantity: 1}
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

const item: Ref<InventoryItem> = ref(props.item)
// const selectedCategory: Ref<InventoryCategory | undefined> = ref(undefined)
const categories: Ref<InventoryCategory[] | undefined> = ref(props.categories)

watch(props, async value => {
  item.value = props.item
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

  if (item.value.category) {
    item.value.category = item.value.category["@id"]
  } else {
    item.value.category = null
  }

  if (!item.value.quantity) {
    item.value.quantity = null
  }
  if (!item.value.sellingQuantity) {
    item.value.sellingQuantity = 1
  }

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

if (!categories.value) {
  getCategories()
}
async function getCategories() {
  const { items } = await inventoryCategoryQuery.getAll();
  categories.value = items.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1))
}

</script>

<template>
  <div class="flex gap-2 flex-col">
    <UFormGroup label="Peut être vendu">
      <UToggle v-model="item.canBeSold" :disabled="props.viewOnly" />
    </UFormGroup>

    <UFormGroup label="Catégorie">
      <USelectMenu
        v-model="item.category"
        :options="categories"
        option-attribute="name"
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
    </UFormGroup>

    <UFormGroup label="Nom">
      <UInput v-model="item.name" :class="props.viewOnly ? 'pointer-events-none' : ''" :tabindex="props.viewOnly ? '-1' : '0'" />
    </UFormGroup>

    <UFormGroup label="Description">
      <UInput v-model="item.description" :class="props.viewOnly ? 'pointer-events-none' : ''" :tabindex="props.viewOnly ? '-1' : '0'" />
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

    <UFormGroup label="Prix d'achat">
      <UInput v-model="item.purchasePrice" :class="props.viewOnly ? 'pointer-events-none' : ''" :tabindex="props.viewOnly ? '-1' : '0'">
        <template #trailing>
          <span class="text-gray-500 dark:text-gray-400 text-xs">EUR</span>
        </template>
      </UInput>
    </UFormGroup>

    <UFormGroup label="Prix de vente">
      <UInput v-model="item.sellingPrice" :class="props.viewOnly ? 'pointer-events-none' : ''" :tabindex="props.viewOnly ? '-1' : '0'">
        <template #trailing>
          <span class="text-gray-500 dark:text-gray-400 text-xs">EUR</span>
        </template>
      </UInput>
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
