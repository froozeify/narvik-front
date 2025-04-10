
export function getTableSortVal(sort: { desc: boolean }): string {
  return sort.desc ? 'desc' : 'asc'
}
