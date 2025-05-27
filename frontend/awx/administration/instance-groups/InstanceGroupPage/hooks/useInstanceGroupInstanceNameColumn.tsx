import { ITableColumn, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { t } from 'i18next';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Instance } from '../../../../interfaces/Instance';
import { AwxRoute } from '../../../../main/AwxRoutes';

export function useInstanceGroupInstanceNameColumn(options?: {
  disableSort?: boolean;
  disableLinks?: boolean;
}) {
  const getPageUrl = useGetPageUrl();
  const params = useParams<{ id?: string }>();
  const { id } = params;
  const column: ITableColumn<Instance> = useMemo<ITableColumn<Instance>>(
    () => ({
      id: 'name',
      type: 'text',
      header: t('Name'),
      sort: 'hostname',
      value: (instance) => instance.hostname,
      to: options?.disableLinks
        ? undefined
        : (instance: Instance) =>
            getPageUrl(AwxRoute.InstanceGroupInstanceDetails, {
              params: { id: id, instance_id: instance.id },
            }),
      card: 'name',
      list: 'name',
      defaultSort: options?.disableSort ? false : true,
    }),
    [getPageUrl, id, options]
  );
  return column;
}
