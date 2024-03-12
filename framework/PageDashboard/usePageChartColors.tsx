import { usePageSettings } from '../PageSettings/PageSettingsProvider';

export function usePageChartColors() {
  const { activeTheme } = usePageSettings();

  let successfulColor = 'var(--pf-v5-chart-color-green-300)';
  let failedColor = 'var(--pf-v5-chart-color-red-100)';
  let errorColor = 'var(--pf-v5-chart-color-orange-300)';
  let warningColor = 'var(--pf-v5-chart-color-gold-400)';
  let canceledColor = 'var(--pf-v5-chart-color-black-400)';
  let blueColor = 'var(--pf-v5-chart-color-blue-300)';
  let cyanColor = 'var(--pf-v5-chart-color-cyan-300)';
  let redColor = 'var(--pf-v5-chart-color-red-100)';
  let greenColor = 'var(--pf-v5-chart-color-green-300)';
  let yellowColor = 'var(--pf-v5-chart-color-gold-400)';
  let purpleColor = 'var(--pf-v5-chart-color-purple-300)';
  let orangeColor = 'var(--pf-v5-chart-color-orange-300)';
  let greyColor = 'var(--pf-v5-chart-color-black-400)';

  switch (activeTheme) {
    case 'dark':
      successfulColor = 'var(--pf-v5-chart-color-green-400)';
      failedColor = 'var(--pf-v5-chart-color-red-400)';
      errorColor = 'var(--pf-v5-chart-color-orange-300)';
      warningColor = 'var(--pf-v5-chart-color-gold-300)';
      canceledColor = 'var(--pf-v5-chart-color-black-400)';
      blueColor = 'var(--pf-v5-chart-color-blue-400)';
      cyanColor = 'var(--pf-v5-chart-color-cyan-400)';
      redColor = 'var(--pf-v5-chart-color-red-400)';
      greenColor = 'var(--pf-v5-chart-color-green-400)';
      yellowColor = 'var(--pf-v5-chart-color-gold-300)';
      purpleColor = 'var(--pf-v5-chart-color-purple-400)';
      orangeColor = 'var(--pf-v5-chart-color-orange-300)';
      greyColor = 'var(--pf-v5-chart-color-black-300)';
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
