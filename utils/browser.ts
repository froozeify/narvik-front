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
