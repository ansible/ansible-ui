import { EditIcon, RocketIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../../framework';
import { RouteObj } from '../../../../Routes';
import { handleLaunch } from '../../../common/util/launchHandlers';
import { JobTemplate } from '../../../interfaces/JobTemplate';
import { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';
import { getJobOutputUrl } from '../../../views/jobs/jobUtils';
import { useDeleteTemplates } from '../hooks/useDeleteTemplates';

export function useTemplateActions(options: {
  onTemplatesDeleted: (templates: (JobTemplate | WorkflowJobTemplate)[]) => void;
}) {
  const { onTemplatesDeleted } = options;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const deleteTemplates = useDeleteTemplates(onTemplatesDeleted);

  return useMemo<IPageAction<JobTemplate>[]>(() => {
    const itemActions: IPageAction<JobTemplate>[] = [
      {
        type: PageActionType.Link,
        selection: PageActionSelection.Single,
        isPinned: true,
        icon: EditIcon,
        label: t('Edit template'),
        ouiaId: 'job-template-detail-edit-button',
        href: (template) => RouteObj.EditJobTemplate.replace(':id', template?.id.toString() ?? ''),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: RocketIcon,
        label: t('Launch template'),
        onClick: async (template) => {
          try {
            const job = await handleLaunch(template?.type as string, template?.id);
            if (job) {
              navigate(getJobOutputUrl(job));
            }
          } catch {
            // handle error
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
  }, [deleteTemplates, navigate, t]);
}
