import { DropdownPosition } from '@patternfly/react-core';
import { EditIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  IPageAction,
  PageActions,
  PageActionType,
  PageDetailsFromColumns,
  PageHeader,
  PageLayout,
} from '../../../framework';
import { useGet } from '../../common/crud/useGet';
import { RouteObj } from '../../Routes';
import { API_PREFIX } from '../constants';
import { EdaExecutionEnvironment } from '../interfaces/EdaExecutionEnvironment';
import { useDeleteExecutionEnvironments } from './hooks/useDeleteExecutionEnvironments';
import { useExecutionEnvironmentColumns } from './hooks/useExecutionEnvironmentColumns';

export function ExecutionEnvironmentDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: executionEnvironment } = useGet<EdaExecutionEnvironment>(
    `${API_PREFIX}/executionEnvironments/${params.id ?? ''}/`
  );
  const deleteExecutionEnvironments = useDeleteExecutionEnvironments((deleted) => {
    if (deleted.length > 0) {
      navigate(RouteObj.EdaProjects);
    }
  });
  const tableColumns = useExecutionEnvironmentColumns();
  const itemActions = useMemo<IPageAction<EdaExecutionEnvironment>[]>(
    () => [
      {
        type: PageActionType.single,
        icon: EditIcon,
        label: t('Edit executionEnvironment'),
        onClick: (executionEnvironment: EdaExecutionEnvironment) =>
          navigate(
            RouteObj.EditEdaExecutionEnvironment.replace(':id', executionEnvironment.id.toString())
          ),
      },
      {
        type: PageActionType.single,
        icon: TrashIcon,
        label: t('Delete executionEnvironment'),
        onClick: (executionEnvironment: EdaExecutionEnvironment) =>
          deleteExecutionEnvironments([executionEnvironment]),
        isDanger: true,
      },
    ],
    [deleteExecutionEnvironments, navigate, t]
  );

  return (
    <PageLayout>
      <PageHeader
        title={executionEnvironment?.name}
        breadcrumbs={[
          { label: t('ExecutionEnvironments'), to: RouteObj.EdaExecutionEnvironments },
          { label: executionEnvironment?.name },
        ]}
        headerActions={
          <PageActions<EdaExecutionEnvironment>
            actions={itemActions}
            position={DropdownPosition.right}
            selectedItem={executionEnvironment}
          />
        }
      />
      <PageDetailsFromColumns item={executionEnvironment} columns={tableColumns} />
    </PageLayout>
  );
}
