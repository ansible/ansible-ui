import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  useGetPageUrl,
} from '@ansible/ansible-ui-framework';
import { useAwxActiveUser } from '@ansible/awx-ui/common/useAwxActiveUser';
import { IAwxView } from '@ansible/awx-ui/common/useAwxView';
import { Token } from '@ansible/awx-ui/interfaces/Token';
import { ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { PlatformRoute } from '../../../../main/PlatformRoutes';
import { useDeleteUserTokens } from '../../../users/hooks/useDeleteAAPUserTokens';

export function useLegacyTokenToolbarActions(view: IAwxView<Token>) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const { activeAwxUser } = useAwxActiveUser();
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
        label: t('Create Legacy token'),
        href: userId
          ? getPageUrl(PlatformRoute.CreateUserLegacyToken, {
              params: { id: activeAwxUser?.id },
            })
          : getPageUrl(PlatformRoute.CreateLegacyToken),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete Legacy tokens'),
        isDanger: true,
        onClick: deleteTokens,
      },
    ],
    [t, userId, getPageUrl, activeAwxUser?.id, deleteTokens]
  );
  return toolbarActions;
}
