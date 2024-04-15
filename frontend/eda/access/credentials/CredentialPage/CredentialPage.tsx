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
} from '../../../../../framework';
import { PageRoutedTabs } from '../../../../../framework/PageTabs/PageRoutedTabs';
import { useGet } from '../../../../common/crud/useGet';
import { edaAPI } from '../../../common/eda-utils';
import { EdaCredential } from '../../../interfaces/EdaCredential';
import { EdaRoute } from '../../../main/EdaRoutes';
import { useDeleteCredentials } from '../hooks/useDeleteCredentials';

export function CredentialPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const pageNavigate = usePageNavigate();
  const { data: credential } = useGet<EdaCredential>(edaAPI`/eda-credentials/${params.id ?? ''}/`);

  const deleteCredentials = useDeleteCredentials((deleted) => {
    if (deleted.length > 0) {
      pageNavigate(EdaRoute.Credentials);
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
          pageNavigate(EdaRoute.EditCredential, { params: { id: credential.id } }),
      },
      {
        type: PageActionType.Seperator,
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
    [deleteCredentials, pageNavigate, t]
  );

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
      <PageRoutedTabs
        backTab={{
          label: t('Back to Credentials'),
          page: EdaRoute.Credentials,
          persistentFilterKey: 'credentials',
        }}
        tabs={[
          { label: t('Details'), page: EdaRoute.CredentialDetails },
          { label: t('Team Access'), page: EdaRoute.CredentialTeamAccess },
          { label: t('User Access'), page: EdaRoute.CredentialUserAccess },
        ]}
        params={{ id: credential?.id }}
      />
    </PageLayout>
  );
}
