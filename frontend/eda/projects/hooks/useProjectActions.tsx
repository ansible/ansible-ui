import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { ButtonVariant } from '@patternfly/react-core';
import { PencilAltIcon, SyncAltIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IEdaView } from '../../common/useEventDrivenView';
import { EdaProject } from '../../interfaces/EdaProject';
import { ImportStateEnum } from '../../interfaces/generated/eda-api';
import { EdaRoute } from '../../main/EdaRoutes';
import { useDeleteProjects } from './useDeleteProjects';
import { useSyncProject } from './useSyncProject';

export function useProjectActions(view: IEdaView<EdaProject>) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const syncProject = useSyncProject(view.unselectItemsAndRefresh);

  const deleteProjects = useDeleteProjects(view.unselectItemsAndRefresh);

  return useMemo<IPageAction<EdaProject>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        variant: ButtonVariant.primary,
        icon: SyncAltIcon,
        isPinned: true,
        isHidden: (project: EdaProject) =>
          project?.import_state === ImportStateEnum.Pending ||
          project?.import_state === ImportStateEnum.Running,
        label: t('Sync project'),
        onClick: (project: EdaProject) => syncProject([project]),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: PencilAltIcon,
        isPinned: true,
        label: t('Edit project'),
        onClick: (project: EdaProject) =>
          pageNavigate(EdaRoute.EditProject, { params: { id: project.id } }),
      },
      {
        type: PageActionType.Seperator,
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete project'),
        onClick: (project: EdaProject) => deleteProjects([project]),
        isDanger: true,
      },
    ],
    [deleteProjects, syncProject, pageNavigate, t]
  );
}
