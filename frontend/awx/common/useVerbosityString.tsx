import { useTranslation } from 'react-i18next';

export function useVerbosityString(value: number | undefined) {
  const { t } = useTranslation();

  switch (value) {
    case 0:
      return t('0 (Normal)');
    case 1:
      return t('1 (Verbose)');
    case 2:
      return t('2 (More Verbose)');
    case 3:
      return t('3 (Debug)');
    case 4:
      return t('4 (Connection Debug)');
    case 5:
      return t('5 (WinRM Debug)');
    default:
      return '';
  }
}
