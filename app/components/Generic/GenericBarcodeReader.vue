<script setup lang="ts">

import {QrcodeStream} from "vue-qrcode-reader";
import type {DetectedBarcode} from "barcode-detector";

const enabled = defineModel<boolean>()

const emit = defineEmits([
  'decoded',
  'aborted'
])

function onDetect(firstDetectedCode: Array<DetectedBarcode>) {
  enabled.value = false
  emit('decoded', firstDetectedCode[0].rawValue)
}

</script>

<template>
  <div v-if="enabled" class="flex flex-wrap flex-col w-full">
    <QrcodeStream
      class="flex-1"
      @detect="onDetect"
      :formats="[
        'linear_codes'
      ]"
    />
    <UButton block
      class="mt-2"
      label="Fermer"
      @click="enabled = false; emit('aborted');"
    />
  </div>
</template>

<style scoped lang="scss">

</style>
