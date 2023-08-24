import { useSettings } from '../Settings';

export function usePageChartColors() {
  const { activeTheme } = useSettings();
  let successfulColor = 'var(--pf-chart-color-green-300)';
  if (activeTheme === 'dark') successfulColor = 'var(--pf-chart-color-green-300)';
  let failedColor = 'var(--pf-chart-color-red-100)';
  if (activeTheme === 'dark') failedColor = 'var(--pf-chart-color-red-300)';
  let errorColor = 'var(--pf-chart-color-red-200)';
  if (activeTheme === 'dark') errorColor = 'var(--pf-chart-color-red-200)';
  let canceledColor = 'var(--pf-chart-color-black-400)';
  if (activeTheme === 'dark') canceledColor = 'var(--pf-chart-color-black-400)';
  return {
    successfulColor,
    failedColor,
    errorColor,
    canceledColor,
  };
}
