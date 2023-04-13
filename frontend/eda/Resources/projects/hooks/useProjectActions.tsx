import { EditIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../../framework';
import { RouteObj } from '../../../../Routes';
import { EdaProject } from '../../../interfaces/EdaProject';
import { IEdaView } from '../../../useEventDrivenView';
import { useDeleteProjects } from './useDeleteProjects';

export function useProjectActions(view: IEdaView<EdaProject>) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deleteProjects = useDeleteProjects(view.unselectItemsAndRefresh);
  return useMemo<IPageAction<EdaProject>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: EditIcon,
        label: t('Edit project'),
        onClick: (project: EdaProject) =>
          navigate(RouteObj.EditEdaProject.replace(':id', project.id.toString())),
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
    [deleteProjects, navigate, t]
  );
}
