export function ItemDescriptionExpandedRow<T extends { description?: string | null | undefined }>(
  item: T
) {
  return item.description ? <>{item.description}</> : undefined;
}
