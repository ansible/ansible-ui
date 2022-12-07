/* istanbul ignore file */

export function compareUnknowns(a: unknown | undefined | null, b: unknown | undefined | null) {
  /* istanbul ignore next */
  if (a == undefined && b == undefined) return 0;
  /* istanbul ignore next */
  if (a == undefined) return 1;
  /* istanbul ignore next */
  if (b == undefined) return -1;

  /* istanbul ignore else */
  if (typeof a === 'string') {
    /* istanbul ignore else */
    if (typeof b === 'string') {
      return compareStrings(a, b);
    } else if (typeof b === 'number') {
      return compareStrings(a, b.toString());
    }
  } else if (typeof a === 'number') {
    /* istanbul ignore else */
    if (typeof b === 'number') {
      return compareNumbers(a, b);
    } else if (typeof b === 'string') {
      return compareStrings(a.toString(), b);
    }
  }
  /* istanbul ignore next */
  return 0;
}

/* istanbul ignore next */
export function compareStrings(a: string | undefined | null, b: string | undefined | null) {
  if (a == undefined && b == undefined) return 0;
  if (a == undefined) return 1;
  if (b == undefined) return -1;
  return a < b ? -1 : a > b ? 1 : 0;
}

/* istanbul ignore next */
export function compareNumbers(a: number | undefined | null, b: number | undefined | null) {
  if (a == undefined && b == undefined) return 0;
  if (a == undefined) return 1;
  if (b == undefined) return -1;
  return a < b ? -1 : a > b ? 1 : 0;
}
