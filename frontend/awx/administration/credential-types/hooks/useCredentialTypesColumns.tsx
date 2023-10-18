import { useTranslation } from 'react-i18next';
import {
  ColumnModalOption,
  ColumnTableOption,
  ITableColumn,
  TextCell,
  useGetPageUrl,
} from '../../../../../framework';
import { useMemo } from 'react';
import { CredentialType } from '../../../interfaces/CredentialType';
import { AwxRoute } from '../../../AwxRoutes';
import { useDescriptionColumn } from '../../../../common/columns';
import { Label, Split } from '@patternfly/react-core';

export function useCredentialTypesColumns() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const descriptionColumn = useDescriptionColumn();

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
        table: ColumnTableOption.Hidden,
        card: 'hidden',
        list: 'hidden',
        sort: 'managed',
        defaultSortDirection: 'desc',
        defaultSort: true,
        modal: ColumnModalOption.Hidden,
      },
    ],
    [getPageUrl, t]
  );
  return tableColumns;
}
