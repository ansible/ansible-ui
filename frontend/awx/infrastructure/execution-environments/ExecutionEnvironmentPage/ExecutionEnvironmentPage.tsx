import { ButtonVariant } from '@patternfly/react-core';
import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { PencilAltIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  IPageAction,
  PageActions,
  PageActionSelection,
  PageActionType,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../../framework';
import { PageRoutedTabs } from '../../../../../framework/PageTabs/PageRoutedTabs';
import { useGetItem } from '../../../../common/crud/useGet';
import { cannotDeleteResource, cannotEditResource } from '../../../../common/utils/RBAChelpers';
import { awxAPI } from '../../../common/api/awx-utils';
import { AwxRoute } from '../../../main/AwxRoutes';
import { ExecutionEnvironment } from '../../../interfaces/ExecutionEnvironment';
import { useDeleteExecutionEnvironments } from '../hooks/useDeleteExecutionEnvironments';

export function ExecutionEnvironmentPage() {
  const params = useParams<{ id: string }>();
  const { t } = useTranslation();

  const getPageUrl = useGetPageUrl();
  const pageNavigate = usePageNavigate();

  const deleteEE = useDeleteExecutionEnvironments((_execution_environment) =>
    pageNavigate(AwxRoute.ExecutionEnvironments)
  );

  const { data: executionEnvironment } = useGetItem<ExecutionEnvironment>(
    awxAPI`/execution_environments/`,
    params.id
  );

  const itemActions: IPageAction<ExecutionEnvironment>[] = useMemo(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PencilAltIcon,
        label: t('Edit execution environment'),
        isDisabled: (executionEnvironment) => cannotEditResource(executionEnvironment, t),
        onClick: (executionEnvironment) =>
          pageNavigate(AwxRoute.EditExecutionEnvironment, {
            params: { id: executionEnvironment.id },
          }),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete execution environment'),
        isHidden: (executionEnvironment) => executionEnvironment.managed,
        isDisabled: (executionEnvironment) => cannotDeleteResource(executionEnvironment, t),
        onClick: (ee: ExecutionEnvironment) => deleteEE([ee]),
        isDanger: true,
      },
    ],
    [t, pageNavigate, deleteEE]
  );

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
            actions={itemActions}
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
        tabs={[
          { label: t('Details'), page: AwxRoute.ExecutionEnvironmentDetails },
          { label: t('Templates'), page: AwxRoute.ExecutionEnvironmentTemplates },
        ]}
        params={{ id: executionEnvironment?.id ?? '' }}
      />
    </PageLayout>
  );
}
