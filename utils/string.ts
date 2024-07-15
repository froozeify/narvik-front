export function formatMonetary(value?: string): string {
  return value ? value.replace('.', ',') + ' €' : 'Non défini'
}
