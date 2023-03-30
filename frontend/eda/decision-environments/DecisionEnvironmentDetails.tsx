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
import { EdaDecisionEnvironment } from '../interfaces/EdaDecisionEnvironment';
import { useDeleteDecisionEnvironments } from './hooks/useDeleteDecisionEnvironments';
import { useDecisionEnvironmentColumns } from './hooks/useDecisionEnvironmentColumns';

export function DecisionEnvironmentDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: decisionEnvironment } = useGet<EdaDecisionEnvironment>(
    `${API_PREFIX}/decision-environments/${params.id ?? ''}/`
  );
  const deleteDecisionEnvironments = useDeleteDecisionEnvironments((deleted) => {
    if (deleted.length > 0) {
      navigate(RouteObj.EdaProjects);
    }
  });
  const tableColumns = useDecisionEnvironmentColumns();
  const itemActions = useMemo<IPageAction<EdaDecisionEnvironment>[]>(
    () => [
      {
        type: PageActionType.single,
        icon: EditIcon,
        label: t('Edit DecisionEnvironment'),
        onClick: (decisionEnvironment: EdaDecisionEnvironment) =>
          navigate(
            RouteObj.EditEdaDecisionEnvironment.replace(':id', decisionEnvironment.id.toString())
          ),
      },
      {
        type: PageActionType.single,
        icon: TrashIcon,
        label: t('Delete DecisionEnvironment'),
        onClick: (decisionEnvironment: EdaDecisionEnvironment) =>
          deleteDecisionEnvironments([decisionEnvironment]),
        isDanger: true,
      },
    ],
    [deleteDecisionEnvironments, navigate, t]
  );

  return (
    <PageLayout>
      <PageHeader
        title={decisionEnvironment?.name}
        breadcrumbs={[
          { label: t('DecisionEnvironments'), to: RouteObj.EdaDecisionEnvironments },
          { label: decisionEnvironment?.name },
        ]}
        headerActions={
          <PageActions<EdaDecisionEnvironment>
            actions={itemActions}
            position={DropdownPosition.right}
            selectedItem={decisionEnvironment}
          />
        }
      />
      <PageDetailsFromColumns item={decisionEnvironment} columns={tableColumns} />
    </PageLayout>
  );
}
