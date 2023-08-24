import { useSettings } from '../Settings';

export function usePageChartColors() {
  const { activeTheme } = useSettings();

  let successfulColor = 'var(--pf-chart-color-green-300)';
  let failedColor = 'var(--pf-chart-color-red-100)';
  let errorColor = 'var(--pf-chart-color-orange-300)';
  let warningColor = 'var(--pf-chart-color-gold-400)';
  let canceledColor = 'var(--pf-chart-color-black-400)';
  let blueColor = 'var(--pf-chart-color-blue-300)';
  let redColor = 'var(--pf-chart-color-red-100)';
  let greenColor = 'var(--pf-chart-color-green-300)';
  let yellowColor = 'var(--pf-chart-color-gold-400)';
  let purpleColor = 'var(--pf-chart-color-purple-300)';
  let orangeColor = 'var(--pf-chart-color-orange-300)';
  let greyColor = 'var(--pf-chart-color-black-400)';

  switch (activeTheme) {
    case 'dark':
      successfulColor = 'var(--pf-chart-color-green-400)';
      failedColor = 'var(--pf-chart-color-red-400)';
      errorColor = 'var(--pf-chart-color-orange-300)';
      warningColor = 'var(--pf-chart-color-gold-300)';
      canceledColor = 'var(--pf-chart-color-black-400)';
      blueColor = 'var(--pf-chart-color-blue-400)';
      redColor = 'var(--pf-chart-color-red-400)';
      greenColor = 'var(--pf-chart-color-green-400)';
      yellowColor = 'var(--pf-chart-color-gold-300)';
      purpleColor = 'var(--pf-chart-color-purple-400)';
      orangeColor = 'var(--pf-chart-color-orange-300)';
      greyColor = 'var(--pf-chart-color-black-300)';
      break;
  }

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
    greenColor,
    greyColor,
    chartColors: [
      blueColor,
      yellowColor,
      purpleColor,
      orangeColor,
      redColor,
      greenColor,
      greyColor,
    ],
  };
}
