import { Content } from '@patternfly/react-core';
import { ITableColumn, TextCell, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SeverityLabel } from '../DeprecationSeverityLabel';
import { DeprecationStat } from './useDeprecationData';
import { AwxRoute } from '../../../main/AwxRoutes';

export type DeprecationRow = DeprecationStat & { severityRank: number };

export function useDeprecationDashboardColumns() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();

  return useMemo<ITableColumn<DeprecationRow>[]>(
    () => [
      {
        header: t('Pattern'),
        cell: (dep) => (
          <>
            <TextCell
              text={dep.type}
              to={getPageUrl(AwxRoute.DeprecationDetails, {
                params: { deprecationType: dep.type },
              })}
            />
            <Content
              component="small"
              style={{
                color: 'var(--pf-t--global--text--color--subtle)',
                marginTop: 'var(--pf-t--global--spacer--xs)',
                display: 'block',
              }}
            >
              {dep.description}
            </Content>
          </>
        ),
        sort: 'type',
        card: 'name',
        list: 'name',
      },
      {
        header: t('Total occurrences'),
        cell: (dep) => <TextCell text={String(dep.count)} />,
        sort: 'count',
      },
      {
        header: t('Severity'),
        cell: (dep) => <SeverityLabel severity={dep.severity} />,
        sort: 'severityRank',
      },
    ],
    [t, getPageUrl]
  );
}
