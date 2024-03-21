import { useTranslation } from 'react-i18next';
import { PageFormSection } from '../../../../../framework/PageForm/Utils/PageFormSection';
import { useGetPromptOnLaunchFields } from '../hooks/scheduleHelpers';
import { InventorySource } from '../../../interfaces/InventorySource';
import { Project } from '../../../interfaces/Project';
import { JobTemplate } from '../../../interfaces/JobTemplate';
import { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';
import { ScheduleFormWizard } from '../types';
import { usePageWizard } from '../../../../../framework/PageWizard/PageWizardProvider';

export function PromptInputs() {
  const { t } = useTranslation();
  const { wizardData } = usePageWizard() as {
    wizardData: ScheduleFormWizard;
  };
  const resource = wizardData.unified_job_template_object as
    | JobTemplate
    | WorkflowJobTemplate
    | InventorySource
    | Project;

  const promptOnLaunchFields = useGetPromptOnLaunchFields(resource);

  return (
    <>
      {promptOnLaunchFields?.length ? (
        <PageFormSection title={t('Prompt on launch fields')}>
          {promptOnLaunchFields.map((field) => field)}
        </PageFormSection>
      ) : null}
    </>
  );
}
