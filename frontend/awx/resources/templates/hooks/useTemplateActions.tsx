import { EditIcon, ProjectDiagramIcon, RocketIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  useGetPageUrl,
  usePageAlertToaster,
} from '../../../../../framework';
import { handleLaunch } from '../../../common/util/launchHandlers';
import { JobTemplate } from '../../../interfaces/JobTemplate';
import { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';
import { useDeleteTemplates } from '../hooks/useDeleteTemplates';
import { AwxRoute } from '../../../AwxRoutes';
import { useActiveUser } from '../../../../common/useActiveUser';

export function useTemplateActions(options: {
  onTemplatesDeleted: (templates: (JobTemplate | WorkflowJobTemplate)[]) => void;
}) {
  const alertToaster = usePageAlertToaster();
  const activeUser = useActiveUser();
  const { onTemplatesDeleted } = options;
  const { t } = useTranslation();
  const deleteTemplates = useDeleteTemplates(onTemplatesDeleted);
  const getPageUrl = useGetPageUrl();
  return useMemo<IPageAction<JobTemplate | WorkflowJobTemplate>[]>(() => {
    const itemActions: IPageAction<JobTemplate | WorkflowJobTemplate>[] = [
      {
        type: PageActionType.Link,
        isHidden: (template) =>
          template?.type !== 'workflow_job_template' ||
          !template?.summary_fields.user_capabilities.edit,

        selection: PageActionSelection.Single,
        isPinned: true,
        icon: ProjectDiagramIcon,
        label: t('Workflow Visualizer'),
        ouiaId: 'job-template-detail-edit-button',
        href: (template) =>
          getPageUrl(AwxRoute.WorkflowVisualizer, { params: { id: template.id } }),
      },
      {
        type: PageActionType.Link,
        selection: PageActionSelection.Single,
        isPinned: true,
        isHidden: (template) => !template?.summary_fields.user_capabilities.edit,
        icon: EditIcon,
        label: t('Edit template'),
        ouiaId: 'job-template-detail-edit-button',
        href: (template) =>
          getPageUrl(
            template.type === 'job_template'
              ? AwxRoute.EditJobTemplate
              : AwxRoute.EditWorkflowJobTemplate,
            { params: { id: template?.id.toString() } }
          ),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: RocketIcon,
        label: t('Launch template'),
        onClick: async (template) => {
          try {
            const job = await handleLaunch(template?.type, template?.id);
            if (job) {
              getPageUrl(AwxRoute.JobPage, {
                params: { id: job.id, job_type: job.type },
              });
            }
          } catch (err) {
            alertToaster.addAlert({
              variant: 'danger',
              title: t('Failed to launch job'),
              children: err instanceof Error && err.message,
            });
          }
        },
        isHidden: (template) =>
          !template?.summary_fields.user_capabilities.start && !activeUser?.is_system_auditor,
        isDisabled: () =>
          activeUser?.is_system_auditor
            ? t('You do not have permission to launch this template')
            : undefined,
        ouiaId: 'job-template-detail-launch-button',
        isDanger: false,
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        isDisabled: (template) =>
          !template?.summary_fields.user_capabilities.delete || activeUser?.is_system_auditor
            ? t('You do not have permission to delete this template')
            : undefined,
        label: t('Delete template'),
        onClick: (template) => {
          if (!template) return;
          deleteTemplates([template]);
        },
        ouiaId: 'job-template-detail-delete-button',
        isDanger: true,
      },
    ];
    return itemActions;
  }, [deleteTemplates, getPageUrl, activeUser?.is_system_auditor, alertToaster, t]);
}
