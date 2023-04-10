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
  const tableColumns = useMemo<ITableColumn<Credential>[]>(
    () => [
      idColumn,
      nameColumn,
      descriptionColumn,
      {
        header: t('Credential type'),
        cell: (credential) => {
          switch (credential.credential_type) {
            case 1:
              return t('Machine');
            case 18:
              return t('Ansible Galaxy/Automation Hub API Token');
          }
          return t('Unknown');
        },
      },
      createdColumn,
      modifiedColumn,
    ],
    [idColumn, nameColumn, descriptionColumn, t, createdColumn, modifiedColumn]
  );
  return tableColumns;
}
