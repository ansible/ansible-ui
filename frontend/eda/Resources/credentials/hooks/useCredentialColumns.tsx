import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ColumnTableOption, ITableColumn, TextCell } from '../../../../../framework';
import { RouteObj } from '../../../../Routes';
import { EdaCredential } from '../../../interfaces/EdaCredential';

export function useCredentialColumns() {
  const { t } = useTranslation();
  return useMemo<ITableColumn<EdaCredential>[]>(
    () => [
      {
        header: t('Name'),
        cell: (credential) => (
          <TextCell
            text={credential.name}
            to={RouteObj.EdaCredentialDetails.replace(':id', credential.id.toString())}
          />
        ),
        card: 'name',
        list: 'name',
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
        header: t('Type'),
        cell: (credential) => <TextCell text={credential.credential_type} />,
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

    [t]
  );
}
