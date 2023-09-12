import {
  ButtonVariant,
  DropdownPosition,
  PageSection,
  Skeleton,
  Stack,
} from '@patternfly/react-core';
import { PencilAltIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  DateTimeCell,
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
import { RouteObj } from '../../../common/Routes';
import { useGet } from '../../../common/crud/useGet';
import { API_PREFIX, SWR_REFRESH_INTERVAL } from '../../constants';
import { EdaCredential } from '../../interfaces/EdaCredential';
import { EdaDecisionEnvironmentRead } from '../../interfaces/EdaDecisionEnvironment';
import { useDeleteDecisionEnvironment } from './hooks/useDeleteDecisionEnvironments';

export function DecisionEnvironmentDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const imageHelpBlock = (
    <>
      <p>
        {t(
          'The full image location, including the container registry, image name, and version tag.'
        )}
      </p>
      <br />
      <p>{t('Examples:')}</p>
      <Trans>
        <code>quay.io/ansible/awx-latest repo/project/image-name:tag</code>
      </Trans>
    </>
  );
  const { data: decisionEnvironment } = useGet<EdaDecisionEnvironmentRead>(
    `${API_PREFIX}/decision-environments/${params.id ?? ''}/`,
    undefined,
    { refreshInterval: SWR_REFRESH_INTERVAL }
  );

  const { data: credential } = useGet<EdaCredential>(
    `${API_PREFIX}/credentials/${decisionEnvironment?.credential?.id ?? ''}/`
  );

  const deleteDecisionEnvironment = useDeleteDecisionEnvironment((deleted) => {
    if (deleted.length > 0) {
      navigate(RouteObj.EdaDecisionEnvironments);
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
          deleteDecisionEnvironment([decisionEnvironment]),
        isDanger: true,
      },
    ],
    [deleteDecisionEnvironment, navigate, t]
  );

  const renderDecisionEnvironmentDetailsTab = (
    decisionEnvironment: EdaDecisionEnvironmentRead | undefined
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
          helpText={t('The token needed to utilize the Decision environment image.')}
        >
          {decisionEnvironment && decisionEnvironment.credential?.id ? (
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
        <PageDetail label={t('Created')}>
          <DateTimeCell format="date-time" value={decisionEnvironment?.created_at} />
        </PageDetail>
        <PageDetail label={t('Last modified')}>
          <DateTimeCell format="date-time" value={decisionEnvironment?.modified_at} />
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
