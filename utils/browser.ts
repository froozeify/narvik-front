export function verifyCameraIsPresent(): Ref<boolean> {
  const isCameraPresent = ref(false)
  navigator.mediaDevices.enumerateDevices().then(devices => {
    devices.forEach(device => {
      if (device.kind === 'videoinput') {
        isCameraPresent.value = true
      }
    })
  })

  return isCameraPresent
}

/**
 * Detecting if the device is tactile.
 * Mainly use to "fix" the nuxt ui bug on UDropdown.
 * The bug should be fixed in nuxt ui v3
 */
export function isTouchDevice() {
  return (('ontouchstart' in window) ||
    (navigator.maxTouchPoints > 0) ||
    (navigator.msMaxTouchPoints > 0));
}
