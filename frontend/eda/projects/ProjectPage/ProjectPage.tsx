import { ButtonVariant } from '@patternfly/react-core';

import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  PageActions,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { PageRoutedTabs } from '@ansible/common-ui/PageRoutedTabs';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { useOptions } from '@ansible/common-ui/crud/useOptions';
import { PencilAltIcon, SyncAltIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { edaAPI } from '../../common/eda-utils';
import { EdaProject } from '../../interfaces/EdaProject';
import { ActionsResponse, OptionsResponse } from '../../interfaces/OptionsResponse';
import { ImportStateEnum } from '../../interfaces/generated/eda-api';
import { EdaRoute } from '../../main/EdaRoutes';
import { useDeleteProjects } from '../hooks/useDeleteProjects';
import { useSyncProject } from '../hooks/useSyncProject';

export function ProjectPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const pageNavigate = usePageNavigate();
  const getPageUrl = useGetPageUrl();
  const { data } = useOptions<OptionsResponse<ActionsResponse>>(
    edaAPI`/projects/${params.id ?? ''}/`
  );
  const canEditProject = Boolean(data && data.actions && data.actions['PATCH']);

  const { data: project, refresh } = useGet<EdaProject>(edaAPI`/projects/${params.id ?? ''}/`);
  const deleteProjects = useDeleteProjects((deleted) => {
    if (deleted.length > 0) {
      pageNavigate(EdaRoute.Projects);
    }
  });

  const syncProject = useSyncProject(refresh);

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
        onClick: (project: EdaProject) => syncProject([project]),
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
            position={'right'}
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
