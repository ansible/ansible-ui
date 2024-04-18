import {
  CopyIcon,
  PencilAltIcon,
  ProjectDiagramIcon,
  RocketIcon,
  TrashIcon,
} from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ButtonVariant } from '@patternfly/react-core';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  useGetPageUrl,
} from '../../../../../framework';
import { JobTemplate } from '../../../interfaces/JobTemplate';
import { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useDeleteTemplates } from '../hooks/useDeleteTemplates';
import { useLaunchTemplate } from './useLaunchTemplate';
import { useCopyTemplate } from './useCopyTemplate';
import { missingResources } from './useTemplateColumns';

type Template = JobTemplate | WorkflowJobTemplate;
type TemplateActionOptions = {
  onTemplatesDeleted: (templates: Template[]) => void;
  onTemplateCopied?: () => unknown;
};

export function useTemplateActions({
  onTemplatesDeleted,
  onTemplateCopied = () => null,
}: TemplateActionOptions) {
  const { t } = useTranslation();
  const deleteTemplates = useDeleteTemplates(onTemplatesDeleted);
  const launchTemplate = useLaunchTemplate();
  const copyTemplate = useCopyTemplate(onTemplateCopied);
  const getPageUrl = useGetPageUrl();

  return useMemo<IPageAction<Template>[]>(() => {
    const itemActions: IPageAction<Template>[] = [
      {
        type: PageActionType.Link,
        isHidden: (template) => template?.type !== 'workflow_job_template',
        selection: PageActionSelection.Single,
        isPinned: true,
        icon: ProjectDiagramIcon,
        label: t('View workflow visualizer'),
        variant: ButtonVariant.primary,
        ouiaId: 'job-template-detail-edit-button',
        href: (template) =>
          getPageUrl(AwxRoute.WorkflowVisualizer, { params: { id: template.id } }),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: RocketIcon,
        label: t('Launch template'),
        onClick: (template: Template) => void launchTemplate(template),
        isDisabled: (template: Template) =>
          missingResources(template)
            ? t('Resources are missing from this template.')
            : !template?.summary_fields.user_capabilities.start
              ? t('You do not have permission to launch this template')
              : undefined,
        ouiaId: 'job-template-detail-launch-button',
        isDanger: false,
        isPinned: true,
      },
      {
        type: PageActionType.Link,
        selection: PageActionSelection.Single,
        isPinned: true,
        isHidden: (template) => !template?.summary_fields?.user_capabilities?.edit,
        icon: PencilAltIcon,
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
        icon: CopyIcon,
        label: t('Copy template'),
        onClick: (template: Template) => copyTemplate(template),
        isDisabled: (template: Template) =>
          !template?.summary_fields.user_capabilities.copy
            ? t('You do not have permission to copy this template')
            : undefined,
        ouiaId: 'job-template-detail-copy-button',
        isDanger: false,
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        isDisabled: (template) =>
          !template?.summary_fields?.user_capabilities?.delete
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
  }, [copyTemplate, deleteTemplates, getPageUrl, launchTemplate, t]);
}
