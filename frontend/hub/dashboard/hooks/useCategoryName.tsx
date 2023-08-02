import { useMemo } from 'react';

export function useCategoryName(category: string, t: (str: string) => string) {
  const categories: { [key: string]: string } = useMemo(
    () => ({
      application: t('Application collections'),
      cloud: t('Cloud collections'),
      database: t('Database collections'),
      infrastructure: t('Infrastructure collections'),
      linux: t('Linux collections'),
      monitoring: t('Monitoring collections'),
      networking: t('Networking collections'),
      security: t('Security collections'),
      storage: t('Storage collections'),
      tools: t('Tools collections'),
      windows: t('Windows collections'),
      eda: t('Event-Driven Ansible content'),
      featured: t('Featured collections'),
      owner: t('My collections'),
    }),
    [t]
  );

  return categories[category] || category;
}
