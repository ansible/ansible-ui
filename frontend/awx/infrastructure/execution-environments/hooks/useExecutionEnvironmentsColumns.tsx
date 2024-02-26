import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageNavigate, ITableColumn } from '../../../../../framework';
import {
  useNameColumn,
  useIdColumn,
  useDescriptionColumn,
  useOrganizationNameColumn,
  useCreatedColumn,
  useModifiedColumn,
} from '../../../../common/columns';
import { ExecutionEnvironment } from '../../../interfaces/ExecutionEnvironment';
import { AwxRoute } from '../../../main/AwxRoutes';

export function useExecutionEnvironmentsColumns(options?: {
  disableSort?: boolean;
  disableLinks?: boolean;
}) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const nameClick = useCallback(
    (executionEnvironment: ExecutionEnvironment) =>
      pageNavigate(AwxRoute.ExecutionEnvironmentDetails, {
        params: { id: executionEnvironment.id },
      }),
    [pageNavigate]
  );
  const nameColumn = useNameColumn({
    ...options,
    onClick: nameClick,
  });
  const idColumn = useIdColumn<ExecutionEnvironment>();
  const descriptionColumn = useDescriptionColumn();
  const organizationColumn = useOrganizationNameColumn(
    AwxRoute.OrganizationDetails,
    options,
    t('Globally available')
  );
  const createdColumn = useCreatedColumn(options);
  const modifiedColumn = useModifiedColumn(options);
  const tableColumns = useMemo<ITableColumn<ExecutionEnvironment>[]>(
    () => [
      idColumn,
      nameColumn,
      descriptionColumn,
      {
        header: t('Image'),
        cell: (executionEnvironment) => executionEnvironment.image,
        sort: 'image',
      },
      organizationColumn,
      createdColumn,
      modifiedColumn,
    ],
    [idColumn, nameColumn, descriptionColumn, t, organizationColumn, createdColumn, modifiedColumn]
  );
  return tableColumns;
}
