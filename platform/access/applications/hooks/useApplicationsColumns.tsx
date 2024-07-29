import { useCallback, useMemo } from 'react';
import { usePageNavigate, ITableColumn } from '../../../../framework';
import { Application } from '../../../../frontend/awx/interfaces/Application';
import {
  useNameColumn,
  useDescriptionColumn,
  useOrganizationNameColumn,
  useCreatedColumn,
  useModifiedColumn,
} from '../../../../frontend/common/columns';
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
