import { PencilAltIcon, SyncAltIcon, TrashIcon } from '@patternfly/react-icons';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  errorToAlertProps,
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageAlertToaster,
} from '../../../../../framework';
import { RouteObj } from '../../../../Routes';
import { EdaProject } from '../../../interfaces/EdaProject';
import { IEdaView } from '../../../useEventDrivenView';
import { useDeleteProjects } from './useDeleteProjects';
import { postRequest } from '../../../../common/crud/Data';
import { API_PREFIX } from '../../../constants';

export function useProjectActions(view: IEdaView<EdaProject>) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deleteProjects = useDeleteProjects(view.unselectItemsAndRefresh);
  const alertToaster = usePageAlertToaster();
  const syncProject = useCallback(
    (project: EdaProject) =>
      postRequest(`${API_PREFIX}/projects/${project.id}/sync/`, undefined)
        .then(() => {
          alertToaster.addAlert({
            title: `${t('Syncing')} ${project?.name || t('project')}`,
            variant: 'success',
            timeout: 5000,
          });
        })
        .catch((err) => alertToaster.addAlert(errorToAlertProps(err))),
    [alertToaster, t]
  );
  return useMemo<IPageAction<EdaProject>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: SyncAltIcon,
        isPinned: true,
        label: t('Sync project'),
        onClick: (project: EdaProject) => syncProject(project),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: PencilAltIcon,
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
    [deleteProjects, syncProject, navigate, t]
  );
}
