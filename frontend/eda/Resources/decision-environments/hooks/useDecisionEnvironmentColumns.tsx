import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ColumnTableOption, ITableColumn, TextCell } from '../../../../../framework';
import { RouteObj } from '../../../../Routes';
import { EdaDecisionEnvironment } from '../../../interfaces/EdaDecisionEnvironment';
import { EdaCredentialCell } from '../../credentials/components/EdaCredentialCell';

export function useDecisionEnvironmentColumns() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return useMemo<ITableColumn<EdaDecisionEnvironment>[]>(
    () => [
      {
        header: t('Name'),
        cell: (decisionEnvironment) => (
          <TextCell
            text={decisionEnvironment.name}
            onClick={() =>
              navigate(
                RouteObj.EdaDecisionEnvironmentDetails.replace(
                  ':id',
                  decisionEnvironment.id.toString()
                )
              )
            }
          />
        ),
        sort: 'name',
        card: 'name',
        list: 'name',
        defaultSort: true,
      },
      {
        header: t('Description'),
        type: 'description',
        value: (decisionEnvironment) => decisionEnvironment.description,
        table: ColumnTableOption.Description,
        card: 'description',
        list: 'description',
      },
      {
        header: t('Image Url'),
        cell: (decisionEnvironment) => (
          <TextCell text={decisionEnvironment.image_url} to={decisionEnvironment.image_url} />
        ),
        value: (decisionEnvironment) => decisionEnvironment.image_url,
      },
      {
        header: t('Credential'),
        cell: (activation) => <EdaCredentialCell id={activation.credential} />,
        value: (activation) => activation.credential,
        // table: ColumnTableOption.Expanded,
        list: 'secondary',
      },
      {
        header: t('Created'),
        type: 'datetime',
        value: (instance) => instance.created_at,
        table: ColumnTableOption.Expanded,
        card: 'hidden',
        list: 'secondary',
      },
      {
        header: t('Last modified'),
        type: 'datetime',
        value: (instance) => instance.modified_at,
        table: ColumnTableOption.Expanded,
        card: 'hidden',
        list: 'secondary',
      },
    ],
    [navigate, t]
  );
}
