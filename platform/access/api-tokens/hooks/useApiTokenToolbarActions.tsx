import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  useGetPageUrl,
} from '@ansible/ansible-ui-framework';
import { ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { IPlatformView } from '../../../hooks/usePlatformView';
import { Token } from '../../../interfaces/Token';
import { usePlatformActiveUser } from '../../../main/PlatformActiveUserProvider';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { useDeleteUserTokens } from '../../users/hooks/useDeleteAAPUserTokens';

export function useApiTokenToolbarActions(view: IPlatformView<Token>) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const { activePlatformUser } = usePlatformActiveUser();
  const { id: userId } = useParams<{ id?: string }>();
  const deleteTokens = useDeleteUserTokens(view.unselectItemsAndRefresh);
  const toolbarActions = useMemo<IPageAction<Token>[]>(
    () => [
      {
        type: PageActionType.Link,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusCircleIcon,
        label: t('Create API token'),
        href: userId
          ? getPageUrl(PlatformRoute.CreateUserApiToken, {
              params: { id: activePlatformUser?.id },
            })
          : getPageUrl(PlatformRoute.CreateApiToken),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete API tokens'),
        isDanger: true,
        onClick: deleteTokens,
      },
    ],
    [t, userId, getPageUrl, activePlatformUser?.id, deleteTokens]
  );
  return toolbarActions;
}
