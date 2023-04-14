import { EditIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../../framework';
import { RouteObj } from '../../../../Routes';
import { EdaCredential } from '../../../interfaces/EdaCredential';
import { IEdaView } from '../../../useEventDrivenView';
import { useDeleteCredentials } from './useDeleteCredentials';

export function useCredentialActions(view: IEdaView<EdaCredential>) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deleteCredentials = useDeleteCredentials(view.unselectItemsAndRefresh);
  return useMemo<IPageAction<EdaCredential>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: EditIcon,
        label: t('Edit credential'),
        onClick: (credential: EdaCredential) =>
          navigate(RouteObj.EditEdaCredential.replace(':id', credential.id.toString())),
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
    [deleteCredentials, navigate, t]
  );
}
