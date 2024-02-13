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
import { awxAPI } from '../../../common/api/awx-utils';
import { Credential } from '../../../interfaces/Credential';
import { CredentialType } from '../../../interfaces/CredentialType';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useAwxGetAllPages } from '../../../common/useAwxGetAllPages';

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

  const { items: allCredTypes } = useAwxGetAllPages<CredentialType>(awxAPI`/credential_types/`);

  const credentialTypesMap: { [id: number]: string } = useMemo(() => {
    if (allCredTypes) {
      return allCredTypes.reduce((acc, credentialType) => {
        const { id, name } = credentialType;
        return { ...acc, [id]: name };
      });
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
