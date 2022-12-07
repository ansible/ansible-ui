import { DropdownPosition, PageSection } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageActions, PageHeader, PageLayout } from '../../../framework';
import { Scrollable } from '../../../framework/components/Scrollable';
import { TableDetails } from '../../../framework/PageTable/PageTableDetails';
import { useSettings } from '../../../framework/Settings';
import { useGet } from '../../common/useItem';
import { RouteE } from '../../Routes';
import { EdaExecutionEnvironment } from '../interfaces/EdaExecutionEnvironment';
import { useExecutionEnvironmentActions } from './hooks/useExecutionEnvironmentActions';
import { useExecutionEnvironmentColumns } from './hooks/useExecutionEnvironmentColumns';

export function ExecutionEnvironmentDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data: executionEnvironment, mutate: refresh } = useGet<EdaExecutionEnvironment>(
    `/api/executionEnvironments/${params.id ?? ''}`
  );
  const settings = useSettings();
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
      <Scrollable>
        <PageSection
          variant="light"
          style={{
            backgroundColor:
              settings.theme === 'dark' ? 'var(--pf-global--BackgroundColor--300)' : undefined,
          }}
        >
          <TableDetails item={executionEnvironment} columns={tableColumns} />
        </PageSection>
      </Scrollable>
    </PageLayout>
  );
}
