import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AwxRoute } from '../../../main/AwxRoutes';
import { PageDetail, PageDetails, useGetPageUrl } from '../../../../../framework';
import { usePageWizard } from '../../../../../framework/PageWizard/PageWizardProvider';
import { PromptReviewDetails } from '../../../resources/templates/WorkflowVisualizer/wizard/PromptReviewDetails';
import { ScheduleFormWizard, ScheduleResources } from '../types';
import { PageFormSection } from '../../../../../framework/PageForm/Utils/PageFormSection';
import { RulesList } from '../components/RulesList';
import { TimezoneToggle } from '../SchedulePage/TimezoneToggle';
import { useEffect, useState } from 'react';
import { getResourceURL } from '../../../resources/templates/WorkflowVisualizer/wizard/helpers';
import { useGetItem } from '../../../../common/crud/useGet';
import { LoadingState } from '../../../../../framework/components/LoadingState';
import { AwxError } from '../../../common/AwxError';

const ResourceLink: { [key: string]: string } = {
  inventory_update: AwxRoute.InventorySourceDetail,
  job: AwxRoute.JobTemplateDetails,
  project: AwxRoute.ProjectDetails,
  management_job_template: AwxRoute.ManagementJobSchedules,
  workflow_approval: AwxRoute.WorkflowApprovalDetails,
  workflow_job: AwxRoute.WorkflowJobTemplateDetails,
};

export function ScheduleReviewStep() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const [isLocal, setIsLocal] = useState(true);

  const { wizardData, visibleSteps, setWizardData } = usePageWizard<ScheduleFormWizard>();
  const {
    schedule_type,
    resourceId,
    resource: nodeResource,
    schedule_days_to_keep,
    name,
    description,
    startDateTime,
    timezone,
    exceptions,
    rules,
  } = wizardData;
  const url = getResourceURL(schedule_type);
  const resourceTypeDetail = useGetScheduleTypeDetail(schedule_type);

  const {
    data: resource,
    isLoading,
    error,
  } = useGetItem<ScheduleResources>(url, resourceId ?? nodeResource.id);
  useEffect(() => {
    if (!resource) return;
    setWizardData((prev) => ({ ...prev, resource, resourceId: resource.id }));
  }, [setWizardData, resource]);
  if (isLoading || !resource) {
    return <LoadingState />;
  }
  if (error) {
    return <AwxError error={error} />;
  }
  const hasPromptDetails = Boolean(
    visibleSteps.find((step) => step.id === 'promptStep' || step.id === 'survey')
  );

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
        <PageDetails numberOfColumns={'two'} disablePadding>
          <PageDetail label={t('Resource type')}>{resourceTypeDetail}</PageDetail>
          <PageDetail label={t('Resource')}>
            <Link to={resourceDetailsLink}>{resource?.name}</Link>
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
        <PageDetail fullWidth label={t('Toggle timezone')}>
          <TimezoneToggle isLocal={isLocal} setIsLocal={setIsLocal} localTimezone={timezone} />
        </PageDetail>
        <RulesList ruleType="rules" rules={rules} timezone={timezone} isLocalForDetails={isLocal} />
        {exceptions.length ? (
          <RulesList
            ruleType="exceptions"
            rules={exceptions}
            timezone={timezone}
            isLocalForDetails={isLocal}
          />
        ) : null}
      </PageFormSection>
    </>
  );
}
function useGetScheduleTypeDetail(type: string) {
  const { t } = useTranslation();
  const typeMapping: { [key: string]: string } = {
    job: t('Job Template'),
    job_template: t('Job Template'),
    workflow_job: t('Workflow Job Template'),
    workflow_job_template: t('Workflow Job Template'),
    project_update: t('Project Update'),
    inventory_update: t('Inventory Update'),
    system_job: t('Management Job'),
    management_job_template: t('Management Job'),
  };
  return typeMapping[type];
}
