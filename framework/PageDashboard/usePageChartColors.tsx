export function usePageChartColors() {
  const successfulColor = 'var(--pf-t--chart--global--success--color--100)';
  const failedColor = 'var(--pf-t--chart--global--danger--color--100)';
  const errorColor = 'var(--pf-t--chart--global--warning--color--200)';
  const warningColor = 'var(--pf-t--chart--global--warning--color--100)';
  const canceledColor = 'var(--pf-t--chart--global--fill--color--300)';
  const blueColor = 'var(--pf-t--chart--color--blue--100)';
  const cyanColor = 'var(--pf-t--chart--color--cyan--300)';
  const redColor = 'var(--pf-t--chart--color--red-orange--100)';
  const greenColor = 'var(--pf-t--chart--color--green--300)';
  const yellowColor = 'var(--pf-t--chart--color--gold--400)';
  const purpleColor = 'var(--pf-t--chart--color--purple--300)';
  const orangeColor = 'var(--pf-t--chart--color--orange--300)';
  const greyColor = 'var(--pf-t--chart--color--black--400)';

  return {
    successfulColor,
    failedColor,
    errorColor,
    warningColor,
    canceledColor,
    blueColor,
    yellowColor,
    purpleColor,
    orangeColor,
    redColor,
    cyanColor,
    greenColor,
    greyColor,
    chartColors: [
      blueColor,
      yellowColor,
      purpleColor,
      orangeColor,
      cyanColor,
      redColor,
      greenColor,
      greyColor,
    ],
  };
}
