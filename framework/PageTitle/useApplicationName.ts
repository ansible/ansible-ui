import { useTranslation } from 'react-i18next';

/** Default application display name when the host app does not pass `applicationName` to `PageTitleProvider`. */
export function useApplicationName(): string {
  const { t } = useTranslation();
  return t('Ansible');
}
