import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { EditAltIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { Token } from '../../../interfaces/Token';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { useDeleteUserTokens } from '../../users/hooks/useDeleteAAPUserTokens';

export function useApiTokenRowActions(onDelete?: (tokens: Token[]) => void) {
  const { t } = useTranslation();
  const { id: userId } = useParams<{ id?: string }>();
  const pageNavigate = usePageNavigate();
  const deleteTokens = useDeleteUserTokens((tokens) => onDelete?.(tokens));
  const rowActions = useMemo<IPageAction<Token>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: EditAltIcon,
        label: t('Edit API token'),
        isPinned: true,
        onClick: (token) => {
          if (userId !== undefined) {
            pageNavigate(PlatformRoute.EditUserApiToken, {
              params: { id: userId, tokenid: token.id },
            });
          } else {
            pageNavigate(PlatformRoute.EditApiToken, { params: { tokenid: token.id } });
          }
        },
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete API token'),
        isDanger: true,
        onClick: (token) => deleteTokens([token]),
      },
    ],
    [deleteTokens, pageNavigate, t, userId]
  );
  return rowActions;
}
