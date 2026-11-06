import { usePageWizard } from '@ansible/ansible-ui-framework/PageWizard/PageWizardProvider';
import { useGetItem } from '@ansible/common-ui/crud/useGet';
import { awxAPI } from '../../../common/api/awx-utils';
import { Project } from '../../../interfaces/Project';
import { ScheduleFormWizard } from '../types';
import { ScheduleLabelSelect } from './ScheduleLabelSelect';

export function ScheduleLabelsInput() {
  const { wizardData, setWizardData } = usePageWizard<ScheduleFormWizard>();
  const resource = wizardData.resource;
  const projectId =
    resource?.type === 'job_template' &&
    (resource.organization === null || resource.organization === undefined)
      ? resource.summary_fields?.project?.id
      : undefined;
  const { data: project } = useGetItem<Project>(awxAPI`/projects`, projectId);
  if (!resource || !('organization' in resource) || !wizardData.prompt) return null;

  return (
    <ScheduleLabelSelect
      organization={resource.organization ?? project?.summary_fields.organization?.id ?? null}
      labels={wizardData.prompt.labels}
      onChange={(labels) =>
        setWizardData((previous) => ({
          ...previous,
          prompt: { ...previous.prompt, labels },
        }))
      }
    />
  );
}
