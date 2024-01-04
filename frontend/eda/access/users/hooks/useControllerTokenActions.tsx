import { ButtonVariant } from '@patternfly/react-core';
import { TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../../framework';
import { IEdaView } from '../../../common/useEventDrivenView';
import { EdaControllerToken } from '../../../interfaces/EdaControllerToken';
import { useDeleteControllerTokens } from './useDeleteControllerTokens';

export function useControllerTokenActions(view: IEdaView<EdaControllerToken>) {
  const { t } = useTranslation();
  const deleteControllerTokens = useDeleteControllerTokens(view.unselectItemsAndRefresh);
  return useMemo<IPageAction<EdaControllerToken>[]>(
    () => [
      {
        type: PageActionType.Button,
        variant: ButtonVariant.primary,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        isPinned: true,
        label: t('Delete controller token'),
        onClick: (token: EdaControllerToken) => deleteControllerTokens([token]),
        isDanger: true,
      },
    ],
    [deleteControllerTokens, t]
  );
}
