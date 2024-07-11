/**
 * Utility function to get arrays containing ids of items to be removed and added
 * based on original and upsdated items
 * @param original original list of items
 * @param current updated list of items
 * @returns object containing 2 lists: ids to be added and ids to be removed
 */
export function getAddedAndRemoved<T extends { id: number }>(original: T[], current: T[]) {
  original = original || [];
  current = current || [];
  const added: T[] = [];
  const removed: T[] = [];
  original.forEach((orig) => {
    if (!current.find((cur) => cur.id === orig.id)) {
      removed.push(orig);
    }
  });
  current.forEach((cur) => {
    if (!original.find((orig) => orig.id === cur.id)) {
      added.push(cur);
    }
  });
  return { added, removed };
}
