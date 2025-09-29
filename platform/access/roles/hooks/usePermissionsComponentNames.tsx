import { useTranslation } from 'react-i18next';

export function usePermissionsComponentNames() {
  const { t } = useTranslation();
  return (permissions: string[]) => {
    const uniqueComponentNames = new Set<string>();

    permissions.forEach((permission: string) => {
      const componentId = permission ? permission.split('.')[0] : '';
      switch (componentId) {
        case 'awx':
          uniqueComponentNames.add(t('Automation Execution'));
          break;
        case 'eda':
          uniqueComponentNames.add(t('Automation Decisions'));
          break;
        case 'galaxy':
          uniqueComponentNames.add(t('Automation Content'));
          break;
        case 'shared':
          switch (permission) {
            case 'shared.view_organization':
              uniqueComponentNames.add(t('Automation Execution'));
              uniqueComponentNames.add(t('Automation Decisions'));
              break;
            default:
              uniqueComponentNames.add(t('Automation Execution'));
              uniqueComponentNames.add(t('Automation Decisions'));
              uniqueComponentNames.add(t('Automation Content'));
              break;
          }
          break;
      }
    });

    return Array.from(uniqueComponentNames);
  };
}
