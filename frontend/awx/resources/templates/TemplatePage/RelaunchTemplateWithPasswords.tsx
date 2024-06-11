import { useNavigate, useParams } from 'react-router-dom';
import { useGetJobOutputUrl } from '../../../views/jobs/useGetJobOutputUrl';
import { usePostRequest } from '../../../../common/crud/usePostRequest';
import {
  LoadingPage,
  PageDetail,
  PageDetails,
  PageHeader,
  PageLayout,
  PageWizard,
  PageWizardStep,
  useGetPageUrl,
  usePageAlertToaster,
} from '../../../../../framework';
import { useTranslation } from 'react-i18next';
import { useGet } from '../../../../common/crud/useGet';
import { awxAPI } from '../../../common/api/awx-utils';
import { UnifiedJob } from '../../../interfaces/UnifiedJob';
import { Job } from '../../../interfaces/Job';
import { AwxError } from '../../../common/AwxError';
import { AwxRoute } from '../../../main/AwxRoutes';
import { awxErrorAdapter } from '../../../common/adapters/awxErrorAdapter';
import { CredentialPasswordsStep } from './steps';
import { LabelGroup } from '@patternfly/react-core';
import { CredentialDetail } from './steps/TemplateLaunchReviewStep';
export interface LaunchPayload {
  credential_passwords: { [key: string]: string };
}

export interface RelaunchConfig {
  passwords_needed_to_start: string[];
  retry_counts: { all: number; failed: number };
}

export function RelaunchTemplate() {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const getJobOutputUrl = useGetJobOutputUrl();
  const getPageUrl = useGetPageUrl();
  const postRequest = usePostRequest<LaunchPayload, UnifiedJob>();
  const alertToaster = usePageAlertToaster();
  const { t } = useTranslation();
  const {
    data: config,
    error: configError,
    refresh: configRefresh,
  } = useGet<RelaunchConfig>(awxAPI`/jobs/${params?.id || ''}/relaunch/`);
  const {
    data: template,
    error: templateError,
    refresh: templateRefresh,
  } = useGet<Job>(awxAPI`/jobs/${params?.id || ''}/`);

  const handleSubmit = async (formValues: LaunchPayload) => {
    if (formValues) {
      try {
        const job = await postRequest(awxAPI`/jobs/${params?.id || ''}/relaunch/`, formValues);
        if (job) {
          navigate(getJobOutputUrl(job));
        }
      } catch (err) {
        alertToaster.addAlert({
          variant: 'danger',
          title: t('Failure to launch'),
          children: err instanceof Error && err.message,
        });
      }
    }
  };

  const refresh = configRefresh || templateRefresh;
  const error = configError || templateError;
  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!config || !template) return <LoadingPage breadcrumbs tabs />;
  const initialValues: {
    credential_passwords: { [key: string]: '' };
  } = {
    credential_passwords: {},
  };
  config.passwords_needed_to_start.forEach((i) => (initialValues['credential_passwords'][i] = ''));
  const steps: PageWizardStep[] = [
    {
      id: 'credential-passwords',
      label: t('Credential Passwords'),
      inputs: <CredentialPasswordsStep<RelaunchConfig> config={config} />,
    },
    {
      id: 'review',
      label: t('Review'),
      element: (
        <PageDetails numberOfColumns="multiple">
          <PageDetail label={t('Name')}>{template.name}</PageDetail>
          <PageDetail label={t('Credentials')}>
            <LabelGroup>
              {template.summary_fields.credentials?.map((credential) => (
                <CredentialDetail credentialID={credential.id} key={credential.id} />
              ))}
            </LabelGroup>
          </PageDetail>
        </PageDetails>
      ),
    },
  ];
  return (
    <PageLayout>
      <PageHeader
        title={t('Relaunch job with passwords')}
        breadcrumbs={[
          { label: t('Jobs'), to: getPageUrl(AwxRoute.Jobs) },
          {
            label: template.name,
            to: getPageUrl(AwxRoute.JobDetails, {
              params: { job_type: 'playbook', id: params.id },
            }),
          },
        ]}
      />
      <PageWizard<LaunchPayload>
        steps={steps}
        defaultValue={initialValues}
        onSubmit={handleSubmit}
        errorAdapter={awxErrorAdapter}
      />
    </PageLayout>
  );
}
