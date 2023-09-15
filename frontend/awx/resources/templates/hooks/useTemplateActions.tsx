import { EditIcon, RocketIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageAlertToaster,
} from '../../../../../framework';
import { RouteObj } from '../../../../common/Routes';
import { handleLaunch } from '../../../common/util/launchHandlers';
import { JobTemplate } from '../../../interfaces/JobTemplate';
import { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';
import { getJobOutputUrl } from '../../../views/jobs/jobUtils';
import { useDeleteTemplates } from '../hooks/useDeleteTemplates';

export function useTemplateActions(options: {
  onTemplatesDeleted: (templates: (JobTemplate | WorkflowJobTemplate)[]) => void;
}) {
  const alertToaster = usePageAlertToaster();

  const { onTemplatesDeleted } = options;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deleteTemplates = useDeleteTemplates(onTemplatesDeleted);

  return useMemo<IPageAction<JobTemplate | WorkflowJobTemplate>[]>(() => {
    const itemActions: IPageAction<JobTemplate | WorkflowJobTemplate>[] = [
      {
        type: PageActionType.Link,
        selection: PageActionSelection.Single,
        isPinned: true,
        icon: EditIcon,
        label: t('Edit template'),
        ouiaId: 'job-template-detail-edit-button',
        href: (template) =>
          (template.type === 'job_template'
            ? RouteObj.EditJobTemplate
            : RouteObj.EditWorkflowJobTemplate
          ).replace(':id', template?.id.toString()) ?? '',
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
              navigate(getJobOutputUrl(job));
            }
          } catch (err) {
            alertToaster.addAlert({
              variant: 'danger',
              title: t('Failed to launch job'),
              children: err instanceof Error && err.message,
            });
          }
        },
        ouiaId: 'job-template-detail-launch-button',
        isDanger: false,
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
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
  }, [deleteTemplates, navigate, alertToaster, t]);
}
