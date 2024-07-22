export function formatMonetary(value?: string|number): string {
  if (typeof value === 'number') {
    value = value.toFixed(2)
  }

  return value ? value.replace('.', ',') + ' €' : 'Non défini'
}
