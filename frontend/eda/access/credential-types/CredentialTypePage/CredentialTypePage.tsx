/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { DropdownPosition } from '@patternfly/react-core/deprecated';
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
import { LoadingPage } from '../../../../../framework';
import { useGetItem } from '../../../../common/crud/useGet';
import { EdaRoute } from '../../../main/EdaRoutes';
import { EdaCredentialType } from '../../../interfaces/EdaCredentialType';
import { edaAPI } from '../../../common/eda-utils';
import { useOptions } from '../../../../common/crud/useOptions';
import { ActionsResponse, OptionsResponse } from '../../../interfaces/OptionsResponse';
import { useMemo } from 'react';
import { PencilAltIcon, TrashIcon } from '@patternfly/react-icons';
import { useDeleteCredentialTypes } from '../hooks/useDeleteCredentialTypes';

export function CredentialTypePage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data } = useOptions<OptionsResponse<ActionsResponse>>(
    edaAPI`/credential-types/${params.id ?? ''}/`
  );
  const canPatchCredentialType = Boolean(data && data.actions && data.actions['PATCH']);

  const { data: credentialType } = useGetItem<EdaCredentialType>(
    edaAPI`/credential-types`,
    params.id
  );
  const pageNavigate = usePageNavigate();
  const deleteCredentialTypes = useDeleteCredentialTypes((deleted) => {
    if (deleted.length > 0) {
      pageNavigate(EdaRoute.Credentials);
    }
  });
  const actions = useMemo(() => {
    const cannotDeleteManagedCredentialType = (credentialType: EdaCredentialType) => {
      if (credentialType.managed) {
        return t(`The credential type cannot be deleted because it is read-only.`);
      }
      return canPatchCredentialType
        ? ''
        : t(`The credential type cannot be deleted due to insufficient permission.`);
    };
    const cannotEditManagedCredentialType = (credentialType: EdaCredentialType) => {
      if (credentialType.managed) {
        return t(`The credential type cannot be edited because it is read-only.`);
      }
      return canPatchCredentialType
        ? ''
        : t(`The credential type cannot be edited due to insufficient permission.`);
    };

    const actions: IPageAction<EdaCredentialType>[] = [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        isPinned: true,
        icon: PencilAltIcon,
        label: t('Edit credential type'),
        isDisabled: (credentialType: EdaCredentialType) =>
          cannotEditManagedCredentialType(credentialType),
        onClick: (credentialType) =>
          pageNavigate(EdaRoute.EditCredentialType, { params: { id: credentialType.id } }),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete credential type'),
        isDisabled: (credentialType: EdaCredentialType) =>
          cannotDeleteManagedCredentialType(credentialType),
        onClick: (credentialType: EdaCredentialType) => deleteCredentialTypes([credentialType]),
        isDanger: true,
      },
    ];

    return actions;
  }, [canPatchCredentialType, deleteCredentialTypes, pageNavigate, t]);

  const getPageUrl = useGetPageUrl();

  if (!credentialType) return <LoadingPage breadcrumbs tabs />;

  const isActionTab = location.href.includes(
    getPageUrl(EdaRoute.CredentialTypeDetails, { params: { id: credentialType?.id } })
  );

  return (
    <PageLayout>
      <PageHeader
        title={credentialType?.name}
        breadcrumbs={[
          { label: t('Credential Types'), to: getPageUrl(EdaRoute.CredentialTypes) },
          { label: credentialType?.name },
        ]}
        headerActions={
          isActionTab ? (
            <PageActions<EdaCredentialType>
              actions={actions}
              position={DropdownPosition.right}
              selectedItem={credentialType}
            />
          ) : (
            <></>
          )
        }
      />
      <PageRoutedTabs
        backTab={{
          label: t('Back to Credential Types'),
          page: EdaRoute.CredentialTypes,
          persistentFilterKey: 'credential-types',
        }}
        tabs={[
          { label: t('Details'), page: EdaRoute.CredentialTypeDetails },
          { label: t('Credentials'), page: EdaRoute.CredentialTypeCredentials },
          { label: t('Team Access'), page: EdaRoute.CredentialTypeTeamAccess },
          { label: t('User Access'), page: EdaRoute.CredentialTypeUserAccess },
        ]}
        params={{ id: credentialType.id }}
      />
    </PageLayout>
  );
}
