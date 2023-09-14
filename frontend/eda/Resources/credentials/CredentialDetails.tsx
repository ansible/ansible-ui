import {
  ButtonVariant,
  DropdownPosition,
  PageSection,
  Skeleton,
  Stack,
} from '@patternfly/react-core';
import { PencilAltIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { TFunction, useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
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
  useGetPageUrl,
} from '../../../../framework';
import { formatDateString } from '../../../../framework/utils/formatDateString';
import { RouteObj } from '../../../common/Routes';
import { useGet } from '../../../common/crud/useGet';
import { EdaRoute } from '../../EdaRoutes';
import { API_PREFIX, SWR_REFRESH_INTERVAL } from '../../constants';
import { EdaCredential } from '../../interfaces/EdaCredential';
import { CredentialOptions } from './EditCredential';
import { useDeleteCredentials } from './hooks/useDeleteCredentials';

export function CredentialDetails() {
  const { t } = useTranslation();
  const credentialTypeHelpBlock = (
    <>
      <p>{t('The credential type defines what the credential will be used for.')}</p>
      <br />
      <p>{t('There are three types:')}</p>
      <p>{t('GitHub Personal Access Token')}</p>
      <p>{t('GitLab Personal Access Token')}</p>
      <p>{t('Container Registry')}</p>
    </>
  );
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: credential } = useGet<EdaCredential>(
    `${API_PREFIX}/credentials/${params.id ?? ''}/`,
    undefined,
    { refreshInterval: SWR_REFRESH_INTERVAL }
  );

  const deleteCredentials = useDeleteCredentials((deleted) => {
    if (deleted.length > 0) {
      navigate(RouteObj.EdaCredentials);
    }
  });

  const itemActions = useMemo<IPageAction<EdaCredential>[]>(
    () => [
      {
        type: PageActionType.Button,
        variant: ButtonVariant.primary,
        selection: PageActionSelection.Single,
        icon: PencilAltIcon,
        isPinned: true,
        label: t('Edit credential'),
        onClick: (credential: EdaCredential) =>
          navigate(RouteObj.EditEdaCredential.replace(':id', credential.id.toString())),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete credential'),
        onClick: (credential: EdaCredential) => deleteCredentials([credential]),
        isDanger: true,
      },
    ],
    [deleteCredentials, navigate, t]
  );

  const renderCredentialDetailsTab = (
    credential: EdaCredential | undefined,
    t: TFunction<'translation', undefined>
  ): JSX.Element => {
    const credentialOption = CredentialOptions(t).find(
      (option) => option.value === credential?.credential_type
    );
    return (
      <PageDetails>
        <PageDetail label={t('Name')}>{credential?.name || ''}</PageDetail>
        <PageDetail label={t('Description')}>{credential?.description || ''}</PageDetail>
        <PageDetail label={t('Credential type')} helpText={credentialTypeHelpBlock}>
          {credentialOption ? credentialOption?.label : credential?.credential_type}
        </PageDetail>
        <PageDetail label={t('Username')}>{credential?.username || ''}</PageDetail>
        <PageDetail label={t('Created')}>
          {credential?.created_at ? formatDateString(credential.created_at) : ''}
        </PageDetail>
        <PageDetail label={t('Last modified')}>
          {credential?.modified_at ? formatDateString(credential.modified_at) : ''}
        </PageDetail>
      </PageDetails>
    );
  };

  const getPageUrl = useGetPageUrl();

  return (
    <PageLayout>
      <PageHeader
        title={credential?.name}
        breadcrumbs={[
          { label: t('Credentials'), to: getPageUrl(EdaRoute.Credentials) },
          { label: credential?.name },
        ]}
        headerActions={
          <PageActions<EdaCredential>
            actions={itemActions}
            position={DropdownPosition.right}
            selectedItem={credential}
          />
        }
      />
      {credential ? (
        <PageTabs>
          <PageTab label={t('Details')}>{renderCredentialDetailsTab(credential, t)}</PageTab>
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
