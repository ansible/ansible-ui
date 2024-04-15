import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ColumnTableOption, ITableColumn, TextCell, useGetPageUrl } from '../../../../../framework';
import { EdaCredential } from '../../../interfaces/EdaCredential';
import { EdaRoute } from '../../../main/EdaRoutes';

export function useCredentialColumns() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  return useMemo<ITableColumn<EdaCredential>[]>(
    () => [
      {
        header: t('Name'),
        cell: (credential) => (
          <TextCell
            text={credential.name}
            to={getPageUrl(EdaRoute.CredentialPage, {
              params: { id: credential.id },
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
      },
      {
        header: t('Credential type'),
        cell: (credential) => <TextCell text={credential?.credential_type?.name} />,
      },
      {
        header: t('Created'),
        type: 'datetime',
        value: (instance) => instance.created_at,
        table: ColumnTableOption.expanded,
        card: 'hidden',
        list: 'secondary',
      },
      {
        header: t('Last modified'),
        type: 'datetime',
        value: (instance) => instance.modified_at,
        table: ColumnTableOption.expanded,
        card: 'hidden',
        list: 'secondary',
      },
    ],
    [getPageUrl, t]
  );
}
