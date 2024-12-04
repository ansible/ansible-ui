import { ITableColumn, useGetPageUrl } from '@ansible/ansible-ui-framework';
import {
  useCreatedColumn,
  useDescriptionColumn,
  useIdColumn,
  useModifiedColumn,
  useNameColumn,
} from '@ansible/common-ui/columns';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxGetAllPages } from '../../../common/useAwxGetAllPages';
import { Credential } from '../../../interfaces/Credential';
import { CredentialType } from '../../../interfaces/CredentialType';
import { AwxRoute } from '../../../main/AwxRoutes';

export function useCredentialsColumns(options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const idColumn = useIdColumn();
  const nameTo = useCallback(
    (credential: Credential) =>
      getPageUrl(AwxRoute.CredentialDetails, { params: { id: credential.id } }),
    [getPageUrl]
  );
  const nameColumn = useNameColumn({
    ...options,
    to: nameTo,
  });
  const descriptionColumn = useDescriptionColumn();
  const createdColumn = useCreatedColumn(options);
  const modifiedColumn = useModifiedColumn(options);

  const { results: allCredTypes } = useAwxGetAllPages<CredentialType>(awxAPI`/credential_types/`);

  const credentialTypesMap: { [id: number]: string } = useMemo(() => {
    const credTypes: { [id: number]: string } = {};
    if (allCredTypes) {
      for (const credentialType of allCredTypes) {
        const { id, name } = credentialType;
        if (id && name) {
          credTypes[id] = name;
        }
      }
      return credTypes;
    } else {
      return {};
    }
  }, [allCredTypes]);
  const tableColumns = useMemo<ITableColumn<Credential>[]>(
    () => [
      idColumn,
      nameColumn,
      descriptionColumn,
      {
        id: 'credential_type',
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
