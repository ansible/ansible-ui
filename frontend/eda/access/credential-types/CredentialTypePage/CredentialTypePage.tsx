/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { PencilAltIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  IPageAction,
  LoadingPage,
  PageActionSelection,
  PageActionType,
  PageActions,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../../framework';
import { PageRoutedTabs } from '../../../../common/PageRoutedTabs';
import { useGetItem } from '../../../../common/crud/useGet';
import { useOptions } from '../../../../common/crud/useOptions';
import { edaAPI } from '../../../common/eda-utils';
import { EdaCredentialType } from '../../../interfaces/EdaCredentialType';
import { ActionsResponse, OptionsResponse } from '../../../interfaces/OptionsResponse';
import { EdaRoute } from '../../../main/EdaRoutes';
import { useDeleteCredentialTypes } from '../hooks/useDeleteCredentialTypes';
import { ButtonVariant } from '@patternfly/react-core';

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
        variant: ButtonVariant.primary,
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
        ]}
        params={{ id: credentialType.id }}
      />
    </PageLayout>
  );
}
