export function arrayIdsMatch(arr1: { id: number }[], arr2: { id: number }[]): boolean {
  if (arr1.length !== arr2.length) {
    return false;
  }

  const idSet1 = new Set(arr1.map((obj) => obj.id));
  const idSet2 = new Set(arr2.map((obj) => obj.id));

  if (idSet1.size !== idSet2.size) {
    return false;
  }
  for (const item of idSet1) {
    if (!idSet2.has(item)) {
      return false;
    }
  }
  return true;
}
