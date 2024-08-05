import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, TextCell, useGetPageUrl } from '../../../../framework';
import { Label } from '@patternfly/react-core';
import { HubRoute } from '../../main/HubRoutes';

import { ExecutionEnvironment } from '../ExecutionEnvironment';

export function useExecutionEnvironmentsColumns(_options?: {
  disableSort?: boolean;
  disableLinks?: boolean;
}) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();

  const tableColumns = useMemo<ITableColumn<ExecutionEnvironment>[]>(
    () => [
      {
        header: t('Container repository name'),
        cell: (executionEnvironment) => (
          <TextCell
            text={executionEnvironment.name}
            to={getPageUrl(HubRoute.ExecutionEnvironmentDetails, {
              params: { id: executionEnvironment.name },
            })}
          />
        ),
        value: (executionEnvironment) => executionEnvironment.name,
        card: 'name',
        list: 'name',
        sort: 'name',
      },
      {
        header: t('Description'),
        type: 'text',
        value: (executionEnvironment) => executionEnvironment.description,
        card: 'description',
        list: 'description',
        sort: 'description',
      },
      {
        header: t('Created'),
        type: 'datetime',
        value: (executionEnvironment) => executionEnvironment.created_at,
        card: 'hidden',
        list: 'secondary',
        sort: 'created_at',
      },
      {
        header: t('Last modified'),
        type: 'datetime',
        value: (executionEnvironment) => executionEnvironment.updated_at,
        card: 'hidden',
        list: 'secondary',
        sort: 'updated_at',
      },
      {
        header: t('Container registry type'),
        cell: (ee) => <Label>{ee.pulp?.repository?.remote ? t`Remote` : t`Local`}</Label>,
      },
    ],
    [getPageUrl, t]
  );
  return tableColumns;
}
