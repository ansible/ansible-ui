import { DropdownPosition, PageSection, Skeleton, Stack } from '@patternfly/react-core';
import { PencilAltIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
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
import { EdaDecisionEnvironment } from '../../interfaces/EdaDecisionEnvironment';
import { useDeleteDecisionEnvironments } from './hooks/useDeleteDecisionEnvironments';

export function DecisionEnvironmentDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const imageHelpBlock = (
    <Trans i18nKey="imageHelpBlock">
      <p>The full image location, including the container registry, image name, and version tag.</p>
      <br />
      <p>Examples:</p>
      <code>quay.io/ansible/awx-latest repo/project/image-name:tag</code>
    </Trans>
  );
  const { data: decisionEnvironment } = useGet<EdaDecisionEnvironment>(
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

  const itemActions = useMemo<IPageAction<EdaDecisionEnvironment>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: PencilAltIcon,
        label: t('Edit decision environment'),
        onClick: (decisionEnvironment: EdaDecisionEnvironment) =>
          navigate(
            RouteObj.EditEdaDecisionEnvironment.replace(':id', `${decisionEnvironment?.id || ''}`)
          ),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete decision environment'),
        onClick: (decisionEnvironment: EdaDecisionEnvironment) =>
          deleteDecisionEnvironments([decisionEnvironment]),
        isDanger: true,
      },
    ],
    [deleteDecisionEnvironments, navigate, t]
  );

  const renderDecisionEnvironmentDetailsTab = (
    decisionEnvironment: EdaDecisionEnvironment | undefined
  ): JSX.Element => {
    return (
      <PageDetails>
        <PageDetail label={t('Name')}>{decisionEnvironment?.name || ''}</PageDetail>
        <PageDetail label={t('Description')}>{decisionEnvironment?.description || ''}</PageDetail>
        <PageDetail label={t('Image')} helpText={imageHelpBlock}>
          {decisionEnvironment?.image_url || ''}
        </PageDetail>
        <PageDetail
          label={t('Credential')}
          helpText={t(
            'Credentials are used for authentication when launching Jobs against machines, synchronizing with inventory sources, and importing project content from a version control system.'
          )}
        >
          {decisionEnvironment && decisionEnvironment.credential ? (
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
          { label: t('Decision Environments'), to: RouteObj.EdaDecisionEnvironments },
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
