/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

export function getAddedAndRemoved(original, current) {
  original = original || [];
  current = current || [];
  const added = [];
  const removed = [];
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
