import { useTranslation } from 'react-i18next';

/** Configurable product name for document titles and dashboard headings (build-time `APPLICATION_NAME`). */
export function useApplicationName(): string {
  const { t } = useTranslation();
  return process.env.APPLICATION_NAME || t('Ansible');
}
