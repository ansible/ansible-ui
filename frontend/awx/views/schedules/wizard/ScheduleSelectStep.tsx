import { usePageAlertToaster } from '@ansible/ansible-ui-framework';
import { LoadingState } from '@ansible/ansible-ui-framework/components/LoadingState';
import { usePageWizard } from '@ansible/ansible-ui-framework/PageWizard/PageWizardProvider';
import { requestGet } from '@ansible/common-ui/crud/Data';
import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { AwxError } from '../../../common/AwxError';
import { awxErrorAdapter } from '../../../common/adapters/awxErrorAdapter';
import { ScheduleLabelsInput } from '../components/ScheduleLabelsInput';
import { ScheduleResourceInputs } from '../components/ScheduleResourceInputs';
import { ScheduleTypeInputs } from '../components/ScheduleTypeInputs';
import { useSchedulePromptDefaults } from '../hooks/useSchedulePromptDefaults';
import { ScheduleFormWizard, ScheduleResources } from '../types';

export function ScheduleSelectStep(
  props: Readonly<{
    resourceEndPoint?: string;
    isTopLevelSchedule?: boolean;
  }>
) {
  const scheduleType = useWatch<ScheduleFormWizard, 'schedule_type'>({ name: 'schedule_type' });
  const resourceId = useWatch<ScheduleFormWizard, 'resourceId'>({ name: 'resourceId' });
  const resource = useWatch<ScheduleFormWizard, 'resource'>({ name: 'resource' });
  const { id, source_id, schedule_id } = useParams();
  const { setValue } = useFormContext();
  const { setStepData, setWizardData, wizardData } = usePageWizard<ScheduleFormWizard>();
  const alertToaster = usePageAlertToaster();
  const { t } = useTranslation();
  const { error, ready } = useSchedulePromptDefaults(resourceId, scheduleType, schedule_id);

  useEffect(() => {
    if (!id || props.resourceEndPoint === undefined) return;
    let cancelled = false;
    const getResource = async () => {
      const scheduleResource = await requestGet<ScheduleResources>(
        `${props.resourceEndPoint ?? ''}${source_id || id}/`
      );
      if (cancelled) return;
      setWizardData((previous) => ({
        ...previous,
        schedule_type: scheduleResource.type,
        resource: scheduleResource,
        resourceId: scheduleResource.id,
      }));
      setStepData((previous) => ({
        ...previous,
        details: {
          ...previous.details,
          schedule_type: scheduleResource.type,
          resource: scheduleResource,
          resourceId: scheduleResource.id,
        },
      }));
      setValue('resource', scheduleResource);
      setValue('resourceId', scheduleResource.id);
      setValue('schedule_type', scheduleResource.type);
    };
    void getResource().catch((error: unknown) => {
      if (cancelled) return;
      const { genericErrors, fieldErrors } = awxErrorAdapter(error);
      alertToaster.addAlert({
        variant: 'danger',
        title: t('Failed to fetch the template for this schedule'),
        children: [...genericErrors, ...fieldErrors].map((error) => (
          <div key={String(error.message)}>{error.message}</div>
        )),
      });
    });
    return () => {
      cancelled = true;
    };
  }, [
    alertToaster,
    id,
    props.resourceEndPoint,
    setStepData,
    setWizardData,
    setValue,
    source_id,
    t,
  ]);

  if (error) return <AwxError error={error} />;
  const hasResource = Boolean(resourceId || resource?.id);
  return (
    <>
      {props.isTopLevelSchedule && <ScheduleTypeInputs />}
      {hasResource ? <ScheduleResourceInputs /> : !props.isTopLevelSchedule && <LoadingState />}
      {ready && !wizardData.launch_config?.ask_labels_on_launch && <ScheduleLabelsInput />}
    </>
  );
}
