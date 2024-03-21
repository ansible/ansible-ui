import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  PageHeader,
  PageLayout,
  PageNotImplemented,
  PageWizard,
  PageWizardStep,
} from '../../../../../framework';
import { useGetPageUrl } from '../../../../../framework/PageNavigation/useGetPageUrl';
import { AwxRoute } from '../../../main/AwxRoutes';
import { ScheduleFormWizard } from '../types';
import { awxErrorAdapter } from '../../../common/adapters/awxErrorAdapter';
import { OccurrencesStep } from './OccurrencesStep';
import { ExceptionsStep } from './ExceptionsStep';
import { ScheduleInputs } from '../components/ScheduleInputs';
import { PromptInputs } from '../components/PromptInputs';
import { getScheduleWizardConfig } from '../hooks/useScheduleWizardConfig';
import { useEffect, useMemo, useState } from 'react';

export function ScheduleAddWizard() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const navigate = useNavigate();
  const params = useParams<{ id?: string; source_id?: string }>();
  const { pathname } = useLocation();
  const [scheduleWizardConfig, setSceduleWizardConfg] = useState({} as ScheduleFormWizard);

  useEffect(() => {
    void (async () => {
      if (params.id) {
        const res = await getScheduleWizardConfig(params, pathname, () => {});
        res !== undefined ? setSceduleWizardConfg(res) : null;
      }
    })();
  }, [params, pathname]);

  const handleSubmit = async (formValues: ScheduleFormWizard) => {
    const { unified_job_template_object = {}, launch_config, prompt } = formValues;
    const promptValues = prompt;
    if (promptValues) {
      if (unified_job_template_object && 'organization' in unified_job_template_object) {
        promptValues.organization = unified_job_template_object.organization ?? null;
      }
      if (launch_config) {
        promptValues.original = {
          launch_config,
        };
      }
    }

    await Promise.resolve();
  };

  const onCancel = () => navigate(-1);

  const steps: PageWizardStep[] = useMemo(
    () => [
      {
        id: 'details',
        label: t('Details'),
        inputs: <ScheduleInputs config={scheduleWizardConfig} />,
      },
      {
        id: 'promptsStep',
        label: t('Prompts'),
        inputs: <PromptInputs />,
      },
      { id: 'survey', label: t('Survey'), element: <PageNotImplemented /> },
      { id: 'occurrences', label: t('Occurrences'), inputs: <OccurrencesStep /> },
      {
        id: 'exceptions',
        label: t('Exceptions'),
        inputs: <ExceptionsStep />,
      },
      { id: 'review', label: t('Review'), inputs: <PageNotImplemented /> },
    ],
    [scheduleWizardConfig, t]
  );

  return (
    <PageLayout>
      <PageHeader
        title={t('Create Schedule')}
        breadcrumbs={[
          { label: t('Schedules'), to: getPageUrl(AwxRoute.Schedules) },
          { label: t('Create Schedule') },
        ]}
      />
      <PageWizard<ScheduleFormWizard>
        steps={steps}
        singleColumn={false}
        onCancel={onCancel}
        defaultValue={scheduleWizardConfig}
        onSubmit={handleSubmit}
        errorAdapter={awxErrorAdapter}
      />
    </PageLayout>
  );
}
