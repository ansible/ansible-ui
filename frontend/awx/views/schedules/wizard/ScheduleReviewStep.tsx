import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AwxRoute } from '../../../main/AwxRoutes';
import { PageDetail, PageDetails, PageWizardStep, useGetPageUrl } from '../../../../../framework';
import { usePageWizard } from '../../../../../framework/PageWizard/PageWizardProvider';
import { PromptReviewDetails } from '../../../resources/templates/WorkflowVisualizer/wizard/PromptReviewDetails';
import { ScheduleFormWizard } from '../types';
import { PageFormSection } from '../../../../../framework/PageForm/Utils/PageFormSection';
import { RulesPreview } from '../components/RulesPreview';
import { ExceptionsPreview } from '../components/ExceptionsPreview';

const ResourceLink: { [key: string]: string } = {
  inventory_update: AwxRoute.InventorySourceDetail,
  job: AwxRoute.JobTemplateDetails,
  project_update: AwxRoute.ProjectDetails,
  system_job: AwxRoute.ManagementJobDetails,
  workflow_approval: AwxRoute.WorkflowApprovalDetails,
  workflow_job: AwxRoute.WorkflowJobTemplateDetails,
};

export function ScheduleReviewStep() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();

  const { wizardData, visibleSteps } = usePageWizard() as {
    wizardData: ScheduleFormWizard;
    visibleSteps: PageWizardStep[];
  };
  const {
    schedule_type,
    resource,

    schedule_days_to_keep,
    name,
    description,
    startDateTime,
    timezone,
    exceptions,
  } = wizardData;

  const hasPromptDetails = Boolean(visibleSteps.find((step) => step.id === 'nodePromptsStep'));
  const resourceTypeDetail = useGetNodeTypeDetail(schedule_type);

  let resourceDetailsLink = getPageUrl(ResourceLink[schedule_type], {
    params: { id: resource?.id },
  });

  if (resource && 'type' in resource && resource.type === 'inventory_source') {
    resourceDetailsLink = getPageUrl(AwxRoute.InventorySourceDetail, {
      params: {
        source_id: resource?.id,
        id: resource?.inventory,
        inventory_type:
          resource?.summary_fields?.inventory.kind === ''
            ? 'inventory'
            : resource?.summary_fields?.inventory.kind,
      },
    });
  }
  return (
    <>
      <PageFormSection title={t('Review')} singleColumn>
        <PageDetails numberOfColumns={name ? 'two' : 'single'} disablePadding>
          <PageDetail label={t('Resource type')}>{resourceTypeDetail}</PageDetail>
          <PageDetail label={t('Resource')}>
            <Link to={resourceDetailsLink}>{name}</Link>
          </PageDetail>
          <PageDetail label={t('Name')}>{name}</PageDetail>
          <PageDetail label={t('Description')}>{description}</PageDetail>
          {startDateTime && (
            <PageDetail label={t('Start date/time')}>
              {startDateTime.date + ', ' + startDateTime.time}
            </PageDetail>
          )}

          <PageDetail label={t('Local time zone')}>{timezone}</PageDetail>
          <PageDetail label={t('Days of data to keep')}>{schedule_days_to_keep}</PageDetail>
          {hasPromptDetails ? <PromptReviewDetails /> : null}
        </PageDetails>
        {name && <RulesPreview />}
        {exceptions.length > 0 && <ExceptionsPreview />}
      </PageFormSection>
    </>
  );
}

function useGetNodeTypeDetail(type: string) {
  const { t } = useTranslation();
  const typeMapping: { [key: string]: string } = {
    job: t('Job Template'),
    workflow_job: t('Workflow Job Template'),
    project_update: t('Project Update'),
    inventory_update: t('Inventory Update'),
    workflow_approval: t('Workflow Approval'),
    system_job: t('Management Job'),
  };
  return typeMapping[type];
}
