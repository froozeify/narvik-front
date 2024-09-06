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

export function createBrowserCsvDownload(filename: string, data: any) {
  const blob = new Blob([data], {type: 'text/csv'})
  if(window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveBlob(blob, filename)
  } else {
    const elem = window.document.createElement('a')
    elem.href = window.URL.createObjectURL(blob)
    elem.download = filename
    document.body.appendChild(elem)
    elem.click()
    document.body.removeChild(elem)
  }
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

export const activeBreakpoint: Ref<string|undefined> = ref(undefined)
export function watchBreakpoint() {
  if (window.screen.width >= 1536) {
    activeBreakpoint.value = '2xl'
  } else if (window.screen.width >= 1280) {
    activeBreakpoint.value = 'xl'
  } else if (window.screen.width >= 1024) {
    activeBreakpoint.value = 'lg'
  } else if (window.screen.width >= 768) {
    activeBreakpoint.value = 'md'
  } else if (window.screen.width >= 640) {
    activeBreakpoint.value = 'sm'
  } else {
    activeBreakpoint.value = 'xs'
  }
}

function checkIsDevice(deviceSizes: Array<string>) {
  return computed(() => {
    if (activeBreakpoint.value === undefined) {
      return false
    }
    return deviceSizes.includes(activeBreakpoint.value)
  })
}

export function isMobile() {
  return checkIsDevice(['xs', 'sm', 'md'])
}

export function isTablet() {
  return checkIsDevice(['lg'])
}

export function isDesktop() {
  return checkIsDevice(['2xl', 'xl'])
}
