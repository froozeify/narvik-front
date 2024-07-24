export function formatMonetary(value?: string|number): string {
  if (typeof value !== 'number' && value !== undefined) {
    value = Number(value)
  }

  return value !== undefined ? value.toLocaleString('fr-FR', { style: "currency", currency: 'EUR' }) : 'Non défini'
}
