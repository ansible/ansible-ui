import { ButtonVariant } from '@patternfly/react-core';
import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { PencilAltIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  PageActions,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../framework';
import { PageRoutedTabs } from '../../../../framework/PageTabs/PageRoutedTabs';
import { useGet } from '../../../common/crud/useGet';
import { edaAPI } from '../../common/eda-utils';
import { EdaDecisionEnvironmentRead } from '../../interfaces/EdaDecisionEnvironment';
import { EdaRoute } from '../../main/EdaRoutes';
import { useDeleteDecisionEnvironment } from '../hooks/useDeleteDecisionEnvironments';

export function DecisionEnvironmentPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const pageNavigate = usePageNavigate();

  const { data: decisionEnvironment } = useGet<EdaDecisionEnvironmentRead>(
    edaAPI`/decision-environments/${params.id ?? ''}/`
  );

  const deleteDecisionEnvironment = useDeleteDecisionEnvironment((deleted) => {
    if (deleted.length > 0) {
      pageNavigate(EdaRoute.DecisionEnvironments);
    }
  });

  const itemActions = useMemo<IPageAction<EdaDecisionEnvironmentRead>[]>(
    () => [
      {
        type: PageActionType.Button,
        variant: ButtonVariant.primary,
        selection: PageActionSelection.Single,
        icon: PencilAltIcon,
        isPinned: true,
        label: t('Edit decision environment'),
        onClick: (decisionEnvironment: EdaDecisionEnvironmentRead) =>
          pageNavigate(EdaRoute.EditDecisionEnvironment, {
            params: { id: decisionEnvironment.id },
          }),
      },
      {
        type: PageActionType.Seperator,
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete decision environment'),
        onClick: (decisionEnvironment: EdaDecisionEnvironmentRead) =>
          deleteDecisionEnvironment([decisionEnvironment]),
        isDanger: true,
      },
    ],
    [deleteDecisionEnvironment, pageNavigate, t]
  );

  const getPageUrl = useGetPageUrl();

  return (
    <PageLayout>
      <PageHeader
        title={decisionEnvironment?.name}
        breadcrumbs={[
          { label: t('Decision Environments'), to: getPageUrl(EdaRoute.DecisionEnvironments) },
          { label: decisionEnvironment?.name },
        ]}
        headerActions={
          <PageActions<EdaDecisionEnvironmentRead>
            actions={itemActions}
            position={DropdownPosition.right}
            selectedItem={decisionEnvironment}
          />
        }
      />
      <PageRoutedTabs
        backTab={{
          label: t('Back to Decision Environments'),
          page: EdaRoute.DecisionEnvironments,
          persistentFilterKey: 'decision_environments',
        }}
        tabs={[
          { label: t('Details'), page: EdaRoute.DecisionEnvironmentDetails },
          { label: t('Team Access'), page: EdaRoute.DecisionEnvironmentTeamAccess },
          { label: t('User Access'), page: EdaRoute.DecisionEnvironmentUserAccess },
        ]}
        params={{ id: decisionEnvironment?.id }}
      />
    </PageLayout>
  );
}
