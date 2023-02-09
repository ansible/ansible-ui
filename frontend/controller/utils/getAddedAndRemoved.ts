import { Credential as ControllerCredential } from '../../awx/interfaces/Credential';
import { Label as ControllerLabel } from '../../awx/interfaces/Label';

type Items = Pick<ControllerCredential, 'id' | 'name'> | Pick<ControllerLabel, 'id' | 'name'>;

export function getAddedAndRemoved(original: Items[], current: Items[]) {
  original = original || [];
  current = current || [];
  const added: Items[] = [];
  const removed: Items[] = [];
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
