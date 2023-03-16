const percentageFormatter = (n: number): string => {
  const formatter = new Intl.NumberFormat('en-US', {
    maximumSignificantDigits: 2,
  });

  return formatter.format(n);
};
export default percentageFormatter;
