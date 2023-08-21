export function nameKeyFn(item: { name: string }) {
  return item.name;
}

export function idKeyFn(item: { id: number | string }) {
  return item.id;
}
