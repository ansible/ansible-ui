import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, usePageNavigate } from '../../../../../framework';
import {
  useCreatedColumn,
  useDescriptionColumn,
  useIdColumn,
  useModifiedColumn,
  useNameColumn,
} from '../../../../common/columns';
import { useGet } from '../../../../common/crud/useGet';
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import { awxAPI } from '../../../common/api/awx-utils';
import { Credential } from '../../../interfaces/Credential';
import { CredentialType } from '../../../interfaces/CredentialType';
import { AwxRoute } from '../../../main/AwxRoutes';

export function useCredentialsColumns(options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const nameClick = useCallback(
    (credential: Credential) =>
      pageNavigate(AwxRoute.CredentialDetails, { params: { id: credential.id } }),
    [pageNavigate]
  );
  const idColumn = useIdColumn();
  const nameColumn = useNameColumn({ ...options, onClick: nameClick });
  const descriptionColumn = useDescriptionColumn();
  const createdColumn = useCreatedColumn(options);
  const modifiedColumn = useModifiedColumn(options);
  const itemsResponse = useGet<AwxItemsResponse<CredentialType>>(
    awxAPI`/credential_types/`.concat(`?page=1&page_size=200`)
  );
  const credentialTypesMap: { [id: number]: string } = useMemo(() => {
    if (itemsResponse?.data?.results) {
      return itemsResponse.data.results.reduce((acc, credentialType) => {
        const { id, name } = credentialType;
        return { ...acc, [id]: name };
      });
    } else {
      return {};
    }
  }, [itemsResponse?.data?.results]);
  const tableColumns = useMemo<ITableColumn<Credential>[]>(
    () => [
      idColumn,
      nameColumn,
      descriptionColumn,
      {
        header: t('Credential type'),
        cell: (credential) => {
          return credentialTypesMap && credentialTypesMap[credential.credential_type]
            ? credentialTypesMap[credential.credential_type]
            : t('Unknown');
        },
        card: 'subtitle',
        list: 'subtitle',
      },
      createdColumn,
      modifiedColumn,
    ],
    [idColumn, nameColumn, descriptionColumn, t, createdColumn, modifiedColumn, credentialTypesMap]
  );
  return tableColumns;
}
