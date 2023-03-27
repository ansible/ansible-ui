import { SelectOptionProps } from '../../types';

/**
 * Get comparator values if their key is in the item list
 */
export const handleCheckboxChips = (
  item: string[],
  comparator: SelectOptionProps[]
): string[] => {
  if (item && comparator) {
    return item.reduce((acc: string[], i) => {
      comparator.forEach(({ key, value }) => {
        if (key === i) {
          acc.push(value);
        }
      });

      return acc;
    }, []);
  }

  return [];
};

/**
 * Convert a list of objects to a list of the last value if defined
 */
export const handleSingleChips = (
  item: string,
  comparator: SelectOptionProps[]
): string[] => {
  if (item && typeof item === 'string' && comparator) {
    let val;
    comparator.forEach(({ key, value }) => {
      if (key === item) {
        val = value;
      }
    });

    if (val !== undefined) {
      return [val];
    }
  }

  return [];
};
