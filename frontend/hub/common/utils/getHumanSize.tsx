import { TFunction } from 'i18next';

const units = [null, 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

export function getHumanSize(x: number, t: TFunction<'translation', undefined>) {
  let l = 0,
    n = x || 0;

  while (n >= 1024 && ++l) {
    n = n / 1024;
  }

  if (l === 0) {
    switch (n) {
      case 1:
        return t(`${n} byte`);
      default:
        return t(`${n} bytes`);
    }
  }

  return n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + units[l];
}
