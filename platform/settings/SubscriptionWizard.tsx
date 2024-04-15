import { Button, Divider, Split, Stack, Text, TextContent } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { t } from 'i18next';
import { useCallback, useEffect, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { Trans } from 'react-i18next';
import { Link } from 'react-router-dom';
import { PageFormCheckbox, PageFormTextInput, PageWizard, PageWizardStep } from '../../framework';
import { PageFormAsyncSingleSelect } from '../../framework/PageForm/Inputs/PageFormAsyncSingleSelect';
import { PageFormFileUpload } from '../../framework/PageForm/Inputs/PageFormFileUpload';
import { PageFormToggleGroup } from '../../framework/PageForm/Inputs/PageFormToggleGroup';
import { PageFormHidden } from '../../framework/PageForm/Utils/PageFormHidden';
import { awxErrorAdapter } from '../../frontend/awx/common/adapters/awxErrorAdapter';
import { awxAPI } from '../../frontend/awx/common/api/awx-utils';
import { useAwxConfig } from '../../frontend/awx/common/useAwxConfig';
import { ILicenseInfo } from '../../frontend/awx/interfaces/Config';
import { postRequest, requestPatch } from '../../frontend/common/crud/Data';
import Analytics from './Analytics.svg';

interface SubscriptionWizardData {
  subscriptionSelection: 'manifest' | 'username';
  subscriptionFile: File;
  username: string;
  password: string;
  analyticsEnabled: boolean;
  pool_id?: string;
}

export function SubscriptionWizard(props: { onSuccess: () => void }) {
  const steps = useMemo(() => {
    const steps: PageWizardStep[] = [
      {
        id: 'subscription',
        label: t('Ansible Automation Platform Subscription'),
        inputs: <SubscriptionStep />,
      },
      {
        id: 'analytics',
        label: t('Analytics'),
        inputs: <AnalyticsStep />,
      },
      {
        id: 'license-agreement',
        label: t('End User License Agreement'),
        element: <LicenseAgreementStep />,
      },
    ];
    return steps;
  }, []);

  const onSubmit = useCallback(
    async (data: SubscriptionWizardData) => {
      switch (data.subscriptionSelection) {
        case 'manifest':
          {
            const manifest = await new Promise((resolve) => {
              const fileReader = new FileReader();
              fileReader.readAsArrayBuffer(data.subscriptionFile);
              fileReader.onload = () => {
                if (!(fileReader.result instanceof ArrayBuffer)) return;
                resolve(arrayBufferToBase64(fileReader.result));
              };
            });
            await postRequest(awxAPI`/config/`, { manifest });
          }
          break;
        case 'username':
          await postRequest(awxAPI`/config/attach/`, { pool_id: data.pool_id });
          break;
      }
      await requestPatch(awxAPI`/settings/system/`, {
        INSIGHTS_TRACKING_STATE: data.analyticsEnabled,
      });
      props.onSuccess();
    },
    [props]
  );

  return (
    <PageWizard<SubscriptionWizardData>
      steps={steps}
      defaultValue={{
        analytics: {
          analyticsEnabled: true,
        },
      }}
      onSubmit={onSubmit}
      errorAdapter={awxErrorAdapter}
      singleColumn
    />
  );
}

function SubscriptionStep() {
  const { setValue, watch } = useFormContext<SubscriptionWizardData>();
  const username = watch('username');
  const password = watch('password');
  useEffect(() => setValue('pool_id', undefined), [username, password, setValue]);
  const querySubscriptions = useCallback(async () => {
    const subscriptions = await postRequest<ILicenseInfo[]>(awxAPI`/config/subscriptions/`, {
      subscriptions_username: username,
      subscriptions_password: password,
    });
    return {
      remaining: 0,
      options:
        subscriptions.map((subscription) => {
          const expires = new Date(subscription.license_date * 1000);
          return {
            label: subscription.subscription_name,
            value: subscription.pool_id,
            description: (
              <Stack>
                <div>
                  <b>{t('Managed nodes: ')}</b>
                  {subscription.instance_count}
                </div>
                <div>
                  <b>{t('Expires: ')}</b>
                  {expires.toLocaleDateString()}
                </div>
              </Stack>
            ),
          };
        }) ?? [],
      next: 1,
    };
  }, [password, username]);

  return (
    <>
      <TextContent>
        <Text component="h1">{t('Welcome to Red Hat Ansible Automation Platform!')}</Text>
        <Text component="p">
          {t('Please complete the steps below to activate your subscription.')}
        </Text>
        <Text component="p">
          {t('If you do not have a subscription, you can visit Red Hat to obtain a ')}
          <a href="https://www.ansible.com/license">{t('trial subscription')}</a>.
        </Text>
      </TextContent>
      <Divider />
      <TextContent>
        <Text component="p">
          {t('Select your Ansible Automation Platform subscription to use.')}
        </Text>
      </TextContent>
      <PageFormToggleGroup<SubscriptionWizardData>
        name="subscriptionSelection"
        options={[
          { value: 'manifest', label: 'Subscription manifest' },
          { value: 'username', label: 'Username / password' },
        ]}
      />
      <PageFormHidden
        watch="subscriptionSelection"
        hidden={(subscriptionSelection) => subscriptionSelection !== 'manifest'}
      >
        <TextContent>
          <Text component="p">
            {t(
              'Upload a Red Hat Subscription Manifest containing your subscription. To generate your subscription manifest, go to '
            )}
            <a href="https://access.redhat.com/management/subscription_allocations">
              {t('subscription allocations')}
            </a>
            {t(' on the Red Hat Customer Portal.')}
          </Text>
        </TextContent>
        <PageFormFileUpload
          name="subscriptionFile"
          label={t('Red Hat subscription manifest')}
          accept=".zip"
          isRequired
        />
      </PageFormHidden>
      <PageFormHidden
        watch="subscriptionSelection"
        hidden={(subscriptionSelection) => subscriptionSelection !== 'username'}
      >
        <TextContent>
          <Text component="p">
            {t(
              'Provide your Red Hat or Red Hat Satellite credentials below and you can choose from a list of your available subscriptions. The credentials you use will be stored for future use in retrieving renewal or expanded subscriptions.'
            )}
          </Text>
        </TextContent>
        <PageFormTextInput<SubscriptionWizardData>
          name="username"
          label={t`Red Hat Username`}
          isRequired
          placeholder={t`Enter your Red Hat username`}
        />
        <PageFormTextInput<SubscriptionWizardData>
          name="password"
          label={t`Red Hat Password`}
          type="password"
          isRequired
          placeholder={t`Enter your Red Hat password`}
        />
        <PageFormAsyncSingleSelect<SubscriptionWizardData>
          name="pool_id"
          label={t('Subscription')}
          queryOptions={querySubscriptions}
          queryErrorText={t('Failed to load subscriptions. Check your credentials.')}
          placeholder={t('Select your subscription')}
          queryLabel={(pool_id) => pool_id?.toString()}
          isRequired
          isDisabled={!username || !password}
        />
      </PageFormHidden>
    </>
  );
}

function AnalyticsStep() {
  return (
    <>
      <TextContent>
        <Text component="h1">{t('Analytics')}</Text>
        <Text component="p">
          <Trans>
            By default, Ansible Automation Platform collects and transmits data on usage to Red Hat.
            For more information, see this{' '}
            <Link
              to="https://docs.ansible.com/automation-controller/latest/html/administration/usability_data_collection.html#automation-analytics"
              target="_blank"
            >
              Ansible Automation Platform documentation page
            </Link>
            . Uncheck the following box to disable this feature.
          </Trans>
        </Text>
      </TextContent>
      <PageFormCheckbox<SubscriptionWizardData>
        name="analyticsEnabled"
        label={t('Automation Analytics')}
        description={t(
          'This data is used to enhance future releases of the Ansible Automation Platform and to provide the Red Hat insights service to subscribers.'
        )}
      />
      <Split hasGutter>
        <div>
          <Analytics />
        </div>
        <Stack hasGutter>
          <TextContent>
            <Text component="h3">{t('Automation Analytics')}</Text>
            <Text component="p">
              {t(
                'Gain insights into your deployments through visual dashboards and organization statistics, calculate your return on investment, and explore automation process details.'
              )}
            </Text>
          </TextContent>
          <Button
            icon={<ExternalLinkAltIcon />}
            iconPosition="end"
            variant="link"
            onClick={() =>
              window.open('https://www.ansible.com/products/automation-analytics', '_blank')
            }
            isInline
            type="button"
          >
            {t('Learn more')}
          </Button>
        </Stack>
      </Split>
    </>
  );
}

function LicenseAgreementStep() {
  const config = useAwxConfig();
  return (
    <TextContent>
      {config?.eula.split('\n').map((line, index) => (
        <Text key={index} component="p">
          {line}
        </Text>
      ))}
    </TextContent>
  );
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
