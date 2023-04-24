import { DropdownPosition, PageSection, Skeleton, Stack } from '@patternfly/react-core';
import { PencilAltIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  PageActions,
  PageDetail,
  PageDetails,
  PageHeader,
  PageLayout,
  PageTab,
  PageTabs,
} from '../../../../framework';
import { RouteObj } from '../../../Routes';
import { useGet } from '../../../common/crud/useGet';
import { API_PREFIX } from '../../constants';
import { EdaCredential } from '../../interfaces/EdaCredential';
import { EdaDecisionEnvironmentRead } from '../../interfaces/EdaDecisionEnvironment';
import { useDeleteDecisionEnvironments } from './hooks/useDeleteDecisionEnvironments';

export function DecisionEnvironmentDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: decisionEnvironment } = useGet<EdaDecisionEnvironmentRead>(
    `${API_PREFIX}/decision-environments/${params.id ?? ''}/`
  );

  const { data: credential } = useGet<EdaCredential>(
    `${API_PREFIX}/credentials/${decisionEnvironment?.credential?.id ?? ''}/`
  );

  const deleteDecisionEnvironments = useDeleteDecisionEnvironments((deleted) => {
    if (deleted.length > 0) {
      navigate(RouteObj.EdaDecisionEnvironments);
    }
  });

  const itemActions = useMemo<IPageAction<EdaDecisionEnvironmentRead>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: PencilAltIcon,
        label: t('Edit decision environment'),
        onClick: (decisionEnvironment: EdaDecisionEnvironmentRead) =>
          navigate(
            RouteObj.EditEdaDecisionEnvironment.replace(':id', `${decisionEnvironment?.id || ''}`)
          ),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete decision environment'),
        onClick: (decisionEnvironment: EdaDecisionEnvironmentRead) =>
          deleteDecisionEnvironments([decisionEnvironment]),
        isDanger: true,
      },
    ],
    [deleteDecisionEnvironments, navigate, t]
  );

  const renderDecisionEnvironmentDetailsTab = (
    decisionEnvironment: EdaDecisionEnvironmentRead | undefined
  ): JSX.Element => {
    return (
      <PageDetails>
        <PageDetail label={t('Name')}>{decisionEnvironment?.name || ''}</PageDetail>
        <PageDetail label={t('Description')}>{decisionEnvironment?.description || ''}</PageDetail>
        <PageDetail label={t('Image')}>{decisionEnvironment?.image_url || ''}</PageDetail>
        <PageDetail label={t('Credential')}>
          {decisionEnvironment && 'credential' in decisionEnvironment ? (
            <Link
              to={RouteObj.EdaCredentialDetails.replace(
                ':id',
                `${decisionEnvironment?.credential?.id || ''}`
              )}
            >
              {credential?.name}
            </Link>
          ) : (
            credential?.name || ''
          )}
        </PageDetail>
      </PageDetails>
    );
  };

  return (
    <PageLayout>
      <PageHeader
        title={decisionEnvironment?.name}
        breadcrumbs={[
          { label: t('Decision environments'), to: RouteObj.EdaDecisionEnvironments },
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
      {decisionEnvironment ? (
        <PageTabs>
          <PageTab label={t('Details')}>
            {renderDecisionEnvironmentDetailsTab(decisionEnvironment)}
          </PageTab>
        </PageTabs>
      ) : (
        <PageTabs>
          <PageTab>
            <PageSection variant="light">
              <Stack hasGutter>
                <Skeleton />
                <Skeleton />
                <Skeleton />
                <Skeleton />
              </Stack>
            </PageSection>
          </PageTab>
        </PageTabs>
      )}
    </PageLayout>
  );
}
