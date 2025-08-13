import { IPageAction, PageActionSelection, PageActionType } from '@ansible/ansible-ui-framework';
import { IAwxView } from '@ansible/awx-ui/common/useAwxView';
import { Token } from '@ansible/awx-ui/interfaces/Token';
import { TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDeleteUserTokens } from '../../../users/hooks/useDeleteAAPUserTokens';

export function useLegacyTokenToolbarActions(view: IAwxView<Token>) {
  const { t } = useTranslation();
  const deleteTokens = useDeleteUserTokens(view.unselectItemsAndRefresh);
  const toolbarActions = useMemo<IPageAction<Token>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete Legacy tokens'),
        isDanger: true,
        onClick: deleteTokens,
      },
    ],
    [t, deleteTokens]
  );
  return toolbarActions;
}
