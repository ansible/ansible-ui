import {
	ButtonVariant
} from '@patternfly/react-core';
import {
	DropdownPosition
} from '@patternfly/react-core/deprecated';
import { PencilAltIcon, SyncAltIcon, TrashIcon } from '@patternfly/react-icons';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  PageActions,
  PageHeader,
  PageLayout,
  errorToAlertProps,
  useGetPageUrl,
  usePageAlertToaster,
  usePageNavigate,
} from '../../../../../framework';
import { PageRoutedTabs } from '../../../../../framework/PageTabs/PageRoutedTabs';
import { postRequest } from '../../../../common/crud/Data';
import { useGet } from '../../../../common/crud/useGet';
import { EdaRoute } from '../../../EdaRoutes';
import { API_PREFIX, SWR_REFRESH_INTERVAL } from '../../../constants';
import { EdaProject } from '../../../interfaces/EdaProject';
import { ImportStateEnum } from '../../../interfaces/generated/eda-api';
import { useDeleteProjects } from '../hooks/useDeleteProjects';

export function ProjectPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const pageNavigate = usePageNavigate();
  const getPageUrl = useGetPageUrl();
  const alertToaster = usePageAlertToaster();

  const { data: project, refresh } = useGet<EdaProject>(
    `${API_PREFIX}/projects/${params.id ?? ''}/`,
    undefined,
    { refreshInterval: SWR_REFRESH_INTERVAL }
  );
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
        .catch((err) => alertToaster.addAlert(errorToAlertProps(err)))
        .finally(() => refresh()),
    [alertToaster, refresh, t]
  );
  const deleteProjects = useDeleteProjects((deleted) => {
    if (deleted.length > 0) {
      pageNavigate(EdaRoute.Projects);
    }
  });

  const itemActions = useMemo<IPageAction<EdaProject>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        variant: ButtonVariant.primary,
        icon: SyncAltIcon,
        isPinned: true,
        label: t('Sync project'),
        isHidden: (project: EdaProject) => {
          return (
            project?.import_state === ImportStateEnum.Pending ||
            project?.import_state === ImportStateEnum.Running
          );
        },
        onClick: (project: EdaProject) => syncProject(project),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: PencilAltIcon,
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
    [deleteProjects, pageNavigate, syncProject, t]
  );

  return (
    <PageLayout>
      <PageHeader
        title={project?.name}
        breadcrumbs={[
          { label: t('Projects'), to: getPageUrl(EdaRoute.Projects) },
          { label: project?.name },
        ]}
        headerActions={
          <PageActions<EdaProject>
            actions={itemActions}
            position={DropdownPosition.right}
            selectedItem={project}
          />
        }
      />
      <PageRoutedTabs
        tabs={[{ label: t('Details'), page: EdaRoute.ProjectDetails }]}
        params={{ id: project?.id }}
      />
    </PageLayout>
  );
}
