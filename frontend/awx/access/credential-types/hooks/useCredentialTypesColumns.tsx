import { Label, Split } from '@patternfly/react-core';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ColumnModalOption,
  ColumnTableOption,
  ITableColumn,
  TextCell,
  useGetPageUrl,
} from '../../../../../framework';
import {
  useCreatedColumn,
  useDescriptionColumn,
  useModifiedColumn,
} from '../../../../common/columns';
import { CredentialType } from '../../../interfaces/CredentialType';
import { AwxRoute } from '../../../main/AwxRoutes';

export function useCredentialTypesColumns() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const descriptionColumn = useDescriptionColumn();
  const createdColumn = useCreatedColumn();
  const modifiedColumn = useModifiedColumn();

  const tableColumns = useMemo<ITableColumn<CredentialType>[]>(
    () => [
      {
        header: t('Name'),
        cell: (credentialType) => (
          <Split hasGutter>
            <TextCell
              text={credentialType.name}
              to={getPageUrl(AwxRoute.CredentialTypeDetails, { params: { id: credentialType.id } })}
            />
            {credentialType.managed && <Label>{t('Read-only')}</Label>}
          </Split>
        ),
        card: 'name',
        list: 'name',
        sort: 'name',
        maxWidth: 200,
      },
      descriptionColumn,
      {
        header: t('Type'),
        cell: (credentialType) =>
          credentialType.managed ? <Label>{t('System provided')}</Label> : null,
        table: ColumnTableOption.hidden,
        card: 'hidden',
        list: 'hidden',
        sort: 'managed',
        defaultSortDirection: 'desc',
        defaultSort: true,
        modal: ColumnModalOption.hidden,
      },
      createdColumn,
      modifiedColumn,
    ],
    [descriptionColumn, getPageUrl, t, createdColumn, modifiedColumn]
  );
  return tableColumns;
}
