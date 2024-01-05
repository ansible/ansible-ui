import { useCallback, useMemo } from 'react';
import { usePageNavigate, ITableColumn } from '../../../../../framework';
import {
  useNameColumn,
  useDescriptionColumn,
  useOrganizationNameColumn,
  useCreatedColumn,
  useModifiedColumn,
} from '../../../../common/columns';
import { AwxRoute } from '../../../AwxRoutes';
import { Application } from '../../../interfaces/Application';

export function useApplicationsColumns(options?: {
  disableSort?: boolean;
  disableLinks?: boolean;
}) {
  const pageNavigate = usePageNavigate();

  const nameClick = useCallback(
    (application: Application) =>
      pageNavigate(AwxRoute.ApplicationDetails, { params: { id: application.id } }),
    [pageNavigate]
  );
  const nameColumn = useNameColumn({
    ...options,
    onClick: nameClick,
  });
  const descriptionColumn = useDescriptionColumn();
  const organizationColumn = useOrganizationNameColumn(AwxRoute.OrganizationDetails, options);
  const createdColumn = useCreatedColumn(options);
  const modifiedColumn = useModifiedColumn({ ...options, disableSort: true });
  const tableColumns = useMemo<ITableColumn<Application>[]>(
    () => [nameColumn, descriptionColumn, organizationColumn, createdColumn, modifiedColumn],
    [nameColumn, descriptionColumn, organizationColumn, createdColumn, modifiedColumn]
  );
  return tableColumns;
}
