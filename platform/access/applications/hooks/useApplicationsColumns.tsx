import { ITableColumn, usePageNavigate } from '@ansible/ansible-ui-framework';
import { Application } from '@ansible/awx-ui/interfaces/Application';
import {
  useCreatedColumn,
  useDescriptionColumn,
  useModifiedColumn,
  useNameColumn,
  useOrganizationNameColumn,
} from '@ansible/common-ui/columns';
import { useCallback, useMemo } from 'react';
import { PlatformRoute } from '../../../main/PlatformRoutes';

export function useApplicationsColumns(options?: {
  disableSort?: boolean;
  disableLinks?: boolean;
}) {
  const pageNavigate = usePageNavigate();

  const nameClick = useCallback(
    (application: Application) =>
      pageNavigate(PlatformRoute.ApplicationDetails, { params: { id: application.id } }),
    [pageNavigate]
  );
  const nameColumn = useNameColumn({
    ...options,
    onClick: nameClick,
  });
  const descriptionColumn = useDescriptionColumn();
  const organizationColumn = useOrganizationNameColumn(PlatformRoute.OrganizationDetails, options);
  const createdColumn = useCreatedColumn({
    userDetailsPageId: PlatformRoute.UserDetails,
    ...options,
  });
  const modifiedColumn = useModifiedColumn({
    ...options,
    disableSort: true,
    userDetailsPageId: PlatformRoute.UserDetails,
  });
  const tableColumns = useMemo<ITableColumn<Application>[]>(
    () => [nameColumn, descriptionColumn, organizationColumn, createdColumn, modifiedColumn],
    [nameColumn, descriptionColumn, organizationColumn, createdColumn, modifiedColumn]
  );
  return tableColumns;
}
