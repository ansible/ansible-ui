import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { useOptions } from '@ansible/common-ui/crud/useOptions';
import { ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { edaAPI } from '../../../common/eda-utils';
import { IEdaView } from '../../../common/useEventDrivenView';
import { EdaCredential } from '../../../interfaces/EdaCredential';
import { ActionsResponse, OptionsResponse } from '../../../interfaces/OptionsResponse';
import { EdaRoute } from '../../../main/EdaRoutes';
import { useDeleteCredentials } from './useDeleteCredentials';

export function useCredentialsActions(view: IEdaView<EdaCredential>) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteCredentials = useDeleteCredentials(view.unselectItemsAndRefresh);
  const { data } = useOptions<OptionsResponse<ActionsResponse>>(edaAPI`/eda-credentials/`);
  const canCreateCredentials = Boolean(data && data.actions && data.actions['POST']);
  return useMemo<IPageAction<EdaCredential>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusCircleIcon,
        label: t('Create credential'),
        isDisabled: canCreateCredentials
          ? undefined
          : t(
              'You do not have permission to create a credential. Please contact your organization administrator if there is an issue with your access.'
            ),
        onClick: () => pageNavigate(EdaRoute.CreateCredential),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete credentials'),
        onClick: (credentials: EdaCredential[]) => deleteCredentials(credentials),
        isDanger: true,
      },
    ],
    [canCreateCredentials, deleteCredentials, pageNavigate, t]
  );
}
