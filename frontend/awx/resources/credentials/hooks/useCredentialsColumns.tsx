import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ITableColumn } from '../../../../../framework';
import { RouteObj } from '../../../../Routes';
import {
  useCreatedColumn,
  useDescriptionColumn,
  useIdColumn,
  useModifiedColumn,
  useNameColumn,
} from '../../../../common/columns';
import { Credential } from '../../../interfaces/Credential';
import { useGet } from '../../../../common/crud/useGet';
import { ItemsResponse } from '../../../../common/crud/Data';
import { CredentialType } from '../../../interfaces/CredentialType';

export function useCredentialsColumns(options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const nameClick = useCallback(
    (credential: Credential) =>
      navigate(RouteObj.CredentialDetails.replace(':id', credential.id.toString())),
    [navigate]
  );
  const idColumn = useIdColumn();
  const nameColumn = useNameColumn({ ...options, onClick: nameClick });
  const descriptionColumn = useDescriptionColumn();
  const createdColumn = useCreatedColumn(options);
  const modifiedColumn = useModifiedColumn(options);
  const itemsResponse = useGet<ItemsResponse<CredentialType>>(
    '/api/v2/credential_types/?page=1&page_size=200'
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
