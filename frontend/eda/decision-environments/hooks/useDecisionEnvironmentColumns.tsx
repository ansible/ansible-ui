import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ColumnModalOption,
  ColumnTableOption,
  ITableColumn,
  TextCell,
  useGetPageUrl,
} from '../../../../framework';
import { EdaCredentialCell } from '../../access/credentials/components/EdaCredentialCell';
import {
  EdaDecisionEnvironment,
  EdaDecisionEnvironmentRead,
} from '../../interfaces/EdaDecisionEnvironment';
import { EdaRoute } from '../../main/EdaRoutes';

export function useDecisionEnvironmentsColumns() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  return useMemo<ITableColumn<EdaDecisionEnvironment>[]>(
    () => [
      {
        header: t('Name'),
        cell: (decisionEnvironment) => (
          <TextCell
            text={decisionEnvironment.name}
            to={getPageUrl(EdaRoute.DecisionEnvironmentPage, {
              params: { id: decisionEnvironment.id },
            })}
          />
        ),
        card: 'name',
        list: 'name',
      },
      {
        header: t('Description'),
        type: 'description',
        value: (decisionEnvironment) => decisionEnvironment.description,
        table: ColumnTableOption.description,
        card: 'description',
        list: 'description',
        modal: ColumnModalOption.hidden,
      },
      {
        header: t('Image'),
        cell: (decisionEnvironment) => <TextCell text={decisionEnvironment.image_url} />,
        value: (decisionEnvironment) => decisionEnvironment.image_url,
        modal: ColumnModalOption.hidden,
      },
      {
        header: t('Credential'),
        cell: (decisionEnvironment) => (
          <EdaCredentialCell eda_credential_id={decisionEnvironment.eda_credential_id} />
        ),
        value: (decisionEnvironment) => decisionEnvironment.eda_credential_id,
      },
      {
        header: t('Created'),
        type: 'datetime',
        value: (instance) => instance.created_at,
        table: ColumnTableOption.expanded,
        card: 'hidden',
        list: 'secondary',
        modal: ColumnModalOption.hidden,
      },
      {
        header: t('Last modified'),
        type: 'datetime',
        value: (instance) => instance.modified_at,
        table: ColumnTableOption.expanded,
        card: 'hidden',
        list: 'secondary',
        modal: ColumnModalOption.hidden,
      },
    ],
    [getPageUrl, t]
  );
}

export function useDecisionEnvironmentColumns() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  return useMemo<ITableColumn<EdaDecisionEnvironmentRead>[]>(
    () => [
      {
        header: t('Name'),
        cell: (decisionEnvironment) => (
          <TextCell
            text={decisionEnvironment.name}
            to={getPageUrl(
              EdaRoute.DecisionEnvironmentPage,

              { params: { id: decisionEnvironment.id } }
            )}
          />
        ),
        card: 'name',
        list: 'name',
      },
      {
        header: t('Description'),
        type: 'description',
        value: (decisionEnvironment) => decisionEnvironment.description,
        table: ColumnTableOption.description,
        card: 'description',
        list: 'description',
        modal: 'hidden',
        dashboard: 'hidden',
      },
      {
        header: t('Image'),
        cell: (decisionEnvironment) => <TextCell text={decisionEnvironment.image_url} />,
        value: (decisionEnvironment) => decisionEnvironment.image_url,
        modal: 'hidden',
        dashboard: 'hidden',
      },
      {
        header: t('Credential'),
        cell: (decisionEnvironment) => (
          <EdaCredentialCell eda_credential_id={decisionEnvironment?.eda_credential?.id} />
        ),
        value: (decisionEnvironment) => decisionEnvironment?.eda_credential?.id,
        modal: 'hidden',
        dashboard: 'hidden',
      },
      {
        header: t('Created'),
        type: 'datetime',
        value: (instance) => instance.created_at,
        table: ColumnTableOption.expanded,
        card: 'hidden',
        list: 'secondary',
        modal: 'hidden',
        dashboard: 'hidden',
      },
      {
        header: t('Last modified'),
        type: 'datetime',
        value: (instance) => instance.modified_at,
        table: ColumnTableOption.expanded,
        card: 'hidden',
        list: 'secondary',
        modal: 'hidden',
        dashboard: 'hidden',
      },
    ],
    [getPageUrl, t]
  );
}
