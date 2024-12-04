import { ITableColumn, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Instance } from '../../../interfaces/Instance';
import { AwxRoute } from '../../../main/AwxRoutes';

export function useInstanceNameColumn(options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const getPageUrl = useGetPageUrl();
  const { t } = useTranslation();
  const nameColumn = useMemo<ITableColumn<Instance>>(
    () => ({
      id: 'name',
      type: 'text',
      header: t('Name'),
      sort: 'hostname',
      value: (instance) => instance.hostname,
      to: !options?.disableLinks
        ? (instance: Instance) =>
            getPageUrl(AwxRoute.InstanceDetails, {
              params: { id: instance.id },
            })
        : undefined,
      card: 'name',
      list: 'name',
      defaultSort: true,
    }),
    [getPageUrl, options?.disableLinks, t]
  );
  return nameColumn;
}
