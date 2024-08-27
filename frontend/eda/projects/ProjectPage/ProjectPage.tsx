import { ButtonVariant } from '@patternfly/react-core';
import { DropdownPosition } from '@patternfly/react-core/deprecated';
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
  useGetPageUrl,
  usePageAlertToaster,
  usePageNavigate,
} from '../../../../framework';
import { PageRoutedTabs } from '../../../common/PageRoutedTabs';
import { postRequest } from '../../../common/crud/Data';
import { useGet } from '../../../common/crud/useGet';
import { edaAPI } from '../../common/eda-utils';
import { EdaProject } from '../../interfaces/EdaProject';
import { ImportStateEnum } from '../../interfaces/generated/eda-api';
import { EdaRoute } from '../../main/EdaRoutes';
import { useDeleteProjects } from '../hooks/useDeleteProjects';
import { useOptions } from '../../../common/crud/useOptions';
import { ActionsResponse, OptionsResponse } from '../../interfaces/OptionsResponse';
import { useEdaErrorMessageParser } from '../../common/edaErrorAdapter';

export function ProjectPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const pageNavigate = usePageNavigate();
  const getPageUrl = useGetPageUrl();
  const parseError = useEdaErrorMessageParser();
  const alertToaster = usePageAlertToaster();
  const { data } = useOptions<OptionsResponse<ActionsResponse>>(
    edaAPI`/projects/${params.id ?? ''}/`
  );
  const canEditProject = Boolean(data && data.actions && data.actions['PATCH']);

  const { data: project, refresh } = useGet<EdaProject>(edaAPI`/projects/${params.id ?? ''}/`);
  const syncProject = useCallback(
    (project: EdaProject) =>
      postRequest(edaAPI`/projects/${project.id.toString()}/sync/`, undefined)
        .then(() => {
          alertToaster.addAlert({
            title: `${t('Syncing')} ${project?.name || t('project')}`,
            variant: 'success',
            timeout: 5000,
          });
        })
        .catch((err: Error) => {
          const errorResults = parseError(err);
          alertToaster.addAlert({
            variant: 'danger',
            title: `${t('Failed to sync')} ${project.name}`,
            children: <>{errorResults.parsedErrors.map((errorResult) => errorResult.message)}</>,
            timeout: 5000,
          });
        })
        .finally(() => refresh()),
    [alertToaster, refresh, parseError, t]
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
        isPinned: true,
        label: t('Edit project'),
        isDisabled: () =>
          canEditProject ? '' : t(`The project cannot be edited due to insufficient permission`),
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
        isDisabled: () =>
          canEditProject ? '' : t(`The project cannot be deleted due to insufficient permission`),
        isDanger: true,
      },
    ],
    [canEditProject, deleteProjects, pageNavigate, syncProject, t]
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
        backTab={{
          label: t('Back to Projects'),
          page: EdaRoute.Projects,
          persistentFilterKey: 'projects',
        }}
        tabs={[
          { label: t('Details'), page: EdaRoute.ProjectDetails },
          { label: t('Team Access'), page: EdaRoute.ProjectTeamAccess },
          { label: t('User Access'), page: EdaRoute.ProjectUserAccess },
        ]}
        params={{ id: project?.id }}
      />
    </PageLayout>
  );
}
