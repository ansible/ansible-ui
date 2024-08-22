import { ButtonVariant } from '@patternfly/react-core';
import { DownloadIcon, PencilAltIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '../../../../../framework';
import { HubRoute } from '../../../main/HubRoutes';
import { HubRemote } from '../Remotes';
import { useDeleteRemotes } from './useDeleteRemotes';
import { downloadTextFile } from '../../../../../framework/utils/download-file';

export function useRemoteActions(options: { onRemotesDeleted: (remotes: HubRemote[]) => void }) {
  const { onRemotesDeleted } = options;
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteRemotes = useDeleteRemotes(onRemotesDeleted);
  const actions = useMemo<IPageAction<HubRemote>[]>(
    () => [
      {
        icon: PencilAltIcon,
        isPinned: true,
        label: t('Edit remote'),
        onClick: (remotes) => pageNavigate(HubRoute.EditRemote, { params: { id: remotes.name } }),
        selection: PageActionSelection.Single,
        type: PageActionType.Button,
        variant: ButtonVariant.primary,
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        variant: ButtonVariant.primary,
        isHidden: (remotes) => !remotes.requirements_file,
        icon: DownloadIcon,
        label: t('Download requirement file'),
        onClick: (remotes) =>
          downloadTextFile('requirement', remotes.requirements_file ?? '', 'yaml'),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        variant: ButtonVariant.primary,
        isHidden: (remotes) => !remotes.client_cert,
        icon: DownloadIcon,
        label: t('Download client certificate'),
        onClick: (remotes) => downloadTextFile('client_cert', remotes.client_cert ?? ''),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        variant: ButtonVariant.primary,
        isHidden: (remotes) => !remotes.ca_cert,
        icon: DownloadIcon,
        label: t('Download CA certificate'),
        onClick: (remotes) => downloadTextFile('ca_cert', remotes.ca_cert ?? ''),
      },
      {
        type: PageActionType.Seperator,
      },
      {
        icon: TrashIcon,
        label: t('Delete remote'),
        onClick: (remotes) => deleteRemotes([remotes]),
        selection: PageActionSelection.Single,
        type: PageActionType.Button,
        isDanger: true,
      },
    ],
    [t, pageNavigate, deleteRemotes]
  );

  return actions;
}
