import { ITableColumn, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { Application } from '@ansible/awx-ui/interfaces/Application';
import { AwxRoute } from '@ansible/awx-ui/main/AwxRoutes';
import {
  useCreatedColumn,
  useDescriptionColumn,
  useModifiedColumn,
  useNameColumn,
  useOrganizationNameColumn,
} from '@ansible/common-ui/columns';
import { useCallback, useMemo } from 'react';
import { PlatformRoute } from '../../../../main/PlatformRoutes';

export function useLegacyApplicationColumns(options?: {
  disableSort?: boolean;
  disableLinks?: boolean;
}) {
  const getPageUrl = useGetPageUrl();
  const nameTo = useCallback(
    (item: Application) =>
      getPageUrl(PlatformRoute.LegacyApplicationDetails, { params: { applicationId: item.id } }),
    [getPageUrl]
  );
  const nameColumn = useNameColumn({
    to: nameTo,
    ...options,
  });
  const appUrlColumn = useMemo<ITableColumn<Application>>(
    () => ({
      type: 'text',
      header: 'URL',
      value: (item) => item.app_url,
    }),
    []
  );
  const descriptionColumn = useDescriptionColumn();
  const organizationColumn = useOrganizationNameColumn(AwxRoute.OrganizationDetails, options);
  const createdColumn = useCreatedColumn({
    userDetailsPageId: AwxRoute.UserDetails,
    ...options,
  });
  const modifiedColumn = useModifiedColumn({
    ...options,
    disableSort: true,
    userDetailsPageId: AwxRoute.UserDetails,
  });
  const tableColumns = useMemo<ITableColumn<Application>[]>(
    () => [
      nameColumn,
      appUrlColumn,
      descriptionColumn,
      organizationColumn,
      createdColumn,
      modifiedColumn,
    ],
    [nameColumn, appUrlColumn, descriptionColumn, organizationColumn, createdColumn, modifiedColumn]
  );
  return tableColumns;
}
