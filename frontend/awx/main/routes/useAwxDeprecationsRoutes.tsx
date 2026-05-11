import { PageNavigationItem } from '@ansible/ansible-ui-framework';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Deprecations } from '../../administration/deprecations/Deprecations';
import { AwxRoute } from '../AwxRoutes';

export function useAwxDeprecationsRoutes() {
  const { t } = useTranslation();
  const deprecationsRoutes = useMemo<PageNavigationItem>(
    () => ({
      id: AwxRoute.Deprecations,
      label: t('Deprecations'),
      path: 'deprecations',
      element: <Deprecations />,
    }),
    [t]
  );
  return deprecationsRoutes;
}
