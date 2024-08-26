import { useMemo } from 'react';
import { ITableColumn } from '../../../../../framework';
import {
  useCreatedColumn,
  useDescriptionColumn,
  useModifiedColumn,
  useNameColumn,
  useOrganizationNameColumn,
} from '../../../../common/columns';
import { Application } from '../../../interfaces/Application';
import { AwxRoute } from '../../../main/AwxRoutes';

export function useApplicationsColumns(options?: {
  disableSort?: boolean;
  disableLinks?: boolean;
}) {
  const nameColumn = useNameColumn({
    ...options,
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
