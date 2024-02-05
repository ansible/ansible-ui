import { ButtonVariant } from '@patternfly/react-core';
import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { PencilAltIcon } from '@patternfly/react-icons';
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
import { awxAPI } from '../../../common/api/awx-utils';
import { ExecutionEnvironment } from '../../../interfaces/ExecutionEnvironment';
import { AwxRoute } from '../../../main/AwxRoutes';

export function ExecutionEnvironmentPage() {
  const params = useParams<{ id: string }>();
  const { t } = useTranslation();

  const getPageUrl = useGetPageUrl();
  const pageNavigate = usePageNavigate();

  const { data: executionEnvironment } = useGetItem<ExecutionEnvironment>(
    awxAPI`/execution_environments/`,
    params.id
  );

  const itemActions: IPageAction<ExecutionEnvironment>[] = useMemo(() => {
    const itemActions: IPageAction<ExecutionEnvironment>[] = [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PencilAltIcon,
        label: t('Edit execution environment'),
        onClick: (executionEnvironment) =>
          pageNavigate(AwxRoute.EditExecutionEnvironment, {
            params: { id: executionEnvironment.id },
          }),
      },
    ];
    return itemActions;
  }, [t, pageNavigate]);

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
