import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  PageActions,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../../framework';
import { PageRoutedTabs } from '../../../../common/PageRoutedTabs';
import { useGetItem } from '../../../../common/crud/useGet';
import { useViewActivityStream } from '../../../access/common/useViewActivityStream';
import { awxAPI } from '../../../common/api/awx-utils';
import { ExecutionEnvironment } from '../../../interfaces/ExecutionEnvironment';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useExecutionEnvRowActions } from '../hooks/useExecutionEnvRowActions';

export function ExecutionEnvironmentPage() {
  const params = useParams<{ id: string }>();
  const { t } = useTranslation();

  const getPageUrl = useGetPageUrl();
  const pageNavigate = usePageNavigate();

  const { data: executionEnvironment } = useGetItem<ExecutionEnvironment>(
    awxAPI`/execution_environments/`,
    params.id
  );
  const itemActions = useExecutionEnvRowActions({
    onDelete: () => pageNavigate(AwxRoute.ExecutionEnvironments),
    onCopy: (res: ExecutionEnvironment) =>
      pageNavigate(AwxRoute.ExecutionEnvironmentDetails, { params: { id: res.id } }),
  });
  const activityStream = useViewActivityStream('execution_environment');

  return (
    <PageLayout>
      <PageHeader
        title={t(`${executionEnvironment?.name}`)}
        breadcrumbs={[
          { label: t('Execution Environments'), to: getPageUrl(AwxRoute.ExecutionEnvironments) },
          { label: executionEnvironment?.name ?? '' },
        ]}
        headerActions={
          <PageActions<ExecutionEnvironment>
            actions={[...activityStream, ...itemActions]}
            position={DropdownPosition.right}
            selectedItem={executionEnvironment}
          />
        }
      />
      <PageRoutedTabs
        backTab={{
          label: t('Back to Execution Environments'),
          page: AwxRoute.ExecutionEnvironments,
          persistentFilterKey: 'execution_environments',
        }}
        tabs={
          /** Role assignments via team/user access tabs are not applicable for managed and global EEs */
          executionEnvironment?.managed || executionEnvironment?.organization === null
            ? [
                { label: t('Details'), page: AwxRoute.ExecutionEnvironmentDetails },
                { label: t('Templates'), page: AwxRoute.ExecutionEnvironmentTemplates },
              ]
            : [
                { label: t('Details'), page: AwxRoute.ExecutionEnvironmentDetails },
                { label: t('Templates'), page: AwxRoute.ExecutionEnvironmentTemplates },
                { label: t('Team Access'), page: AwxRoute.ExecutionEnvironmentTeamAccess },
                { label: t('User Access'), page: AwxRoute.ExecutionEnvironmentUserAccess },
              ]
        }
        params={{ id: executionEnvironment?.id ?? '' }}
      />
    </PageLayout>
  );
}
