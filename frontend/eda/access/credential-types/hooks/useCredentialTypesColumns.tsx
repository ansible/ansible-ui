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
import { useDescriptionColumn } from '../../../../common/columns';
import { EdaRoute } from '../../../main/EdaRoutes';
import { EdaCredentialType } from '../../../interfaces/EdaCredentialType';

export function useCredentialTypesColumns(options?: { disableLinks?: boolean }) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const descriptionColumn = useDescriptionColumn();

  const tableColumns = useMemo<ITableColumn<EdaCredentialType>[]>(
    () => [
      {
        header: t('Name'),
        cell: (credentialType) => (
          <Split hasGutter>
            <TextCell
              text={credentialType.name}
              to={
                options?.disableLinks
                  ? undefined
                  : getPageUrl(EdaRoute.CredentialTypeDetails, {
                      params: { id: credentialType.id },
                    })
              }
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
    ],
    [descriptionColumn, getPageUrl, options?.disableLinks, t]
  );
  return tableColumns;
}
