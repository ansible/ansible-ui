import { DropdownPosition, PageSection, Skeleton, Stack } from '@patternfly/react-core';
import { EditIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  IPageAction,
  PageActions,
  PageActionType,
  PageDetail,
  PageDetails,
  PageHeader,
  PageLayout,
  PageTab,
  PageTabs,
} from '../../../../framework';
import { formatDateString } from '../../../../framework/utils/formatDateString';
import { useGet } from '../../../common/crud/useGet';
import { RouteObj } from '../../../Routes';
import { API_PREFIX } from '../../constants';
import { EdaCredential } from '../../interfaces/EdaCredential';
import { useDeleteCredentials } from './hooks/useDeleteCredentials';
import { CredentialOptions } from './EditCredential';

export function CredentialDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: credential } = useGet<EdaCredential>(
    `${API_PREFIX}/credentials/${params.id ?? ''}/`
  );

  const deleteCredentials = useDeleteCredentials((deleted) => {
    if (deleted.length > 0) {
      navigate(RouteObj.EdaCredentials);
    }
  });

  const itemActions = useMemo<IPageAction<EdaCredential>[]>(
    () => [
      {
        type: PageActionType.single,
        icon: EditIcon,
        label: t('Edit credential'),
        onClick: (credential: EdaCredential) =>
          navigate(RouteObj.EditEdaCredential.replace(':id', credential.id.toString())),
      },
      {
        type: PageActionType.single,
        icon: TrashIcon,
        label: t('Delete credential'),
        onClick: (credential: EdaCredential) => deleteCredentials([credential]),
        isDanger: true,
      },
    ],
    [deleteCredentials, navigate, t]
  );

  const renderCredentialDetailsTab = (credential: EdaCredential | undefined): JSX.Element => {
    const credentialOption = CredentialOptions().find(
      (option) => option.value === credential?.credential_type
    );
    return (
      <PageDetails>
        <PageDetail label={t('Name')}>{credential?.name || ''}</PageDetail>
        <PageDetail label={t('Description')}>{credential?.description || ''}</PageDetail>
        <PageDetail label={t('Username')}>{credential?.username || ''}</PageDetail>
        <PageDetail label={t('Credential type')}>
          {credentialOption ? credentialOption?.label : credential?.credential_type}
        </PageDetail>
        <PageDetail label={t('Created')}>
          {credential?.created_at ? formatDateString(credential.created_at) : ''}
        </PageDetail>
        <PageDetail label={t('Last modified')}>
          {credential?.modified_at ? formatDateString(credential.modified_at) : ''}
        </PageDetail>
      </PageDetails>
    );
  };

  return (
    <PageLayout>
      <PageHeader
        title={credential?.name}
        breadcrumbs={[
          { label: t('Credentials'), to: RouteObj.EdaCredentials },
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
          <PageTab label={t('Details')}>{renderCredentialDetailsTab(credential)}</PageTab>
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
