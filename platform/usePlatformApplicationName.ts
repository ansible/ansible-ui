import { useTranslation } from 'react-i18next';
import { getBuildApplicationName } from './applicationName';

export function usePlatformApplicationName(): string {
  const { t } = useTranslation();
  return getBuildApplicationName() || t('Ansible');
}
