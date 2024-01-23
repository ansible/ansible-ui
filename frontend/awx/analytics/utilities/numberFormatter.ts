export const numberFormatter = (n: number): string => {
  const formatter = new Intl.NumberFormat('en-US', {
    maximumSignificantDigits: 2,
  });

  return formatter.format(n);
};
