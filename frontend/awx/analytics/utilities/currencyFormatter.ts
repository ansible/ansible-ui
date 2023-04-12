const currencyFormatter = (n: number): string => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  return formatter.format(n); /* $2,500.00 */
};
export default currencyFormatter;
