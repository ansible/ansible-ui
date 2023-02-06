import { DropdownPosition } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageActions, PageHeader, PageLayout } from '../../../framework';
import { PageDetailsFromColumns } from '../../../framework/PageDetails/PageDetailsFromColumns';
import { useGet } from '../../common/useItem';
import { RouteE } from '../../Routes';
import { EdaExecutionEnvironment } from '../interfaces/EdaExecutionEnvironment';
import { useExecutionEnvironmentActions } from './hooks/useExecutionEnvironmentActions';
import { useExecutionEnvironmentColumns } from './hooks/useExecutionEnvironmentColumns';

export function ExecutionEnvironmentDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data: executionEnvironment, mutate: refresh } = useGet<EdaExecutionEnvironment>(
    `/eda/api/v1/executionEnvironments/${params.id ?? ''}`
  );
  const tableColumns = useExecutionEnvironmentColumns();
  const itemActions = useExecutionEnvironmentActions(refresh);
  return (
    <PageLayout>
      <PageHeader
        title={executionEnvironment?.name}
        breadcrumbs={[
          { label: t('ExecutionEnvironments'), to: RouteE.EdaExecutionEnvironments },
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
