import { useTranslation } from 'react-i18next';

export function useGetTimeoutString(value: number) {
  const { t } = useTranslation();
  const timeout = value || 0;
  const minutes = Math.floor(timeout / 60);
  const seconds = Math.floor(timeout % 60);
  return t('{{minutes}} min {{seconds}} sec ', {
    minutes: minutes.toString(),
    seconds: seconds.toString(),
  });
}
