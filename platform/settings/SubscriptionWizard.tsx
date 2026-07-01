import {
  PageFormCheckbox,
  PageFormTextInput,
  PageWizard,
  PageWizardStep,
} from '@ansible/ansible-ui-framework';
import { PageFormAsyncSingleSelect } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormAsyncSingleSelect';
import { PageFormFileUpload } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormFileUpload';
import { PageFormToggleGroup } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormToggleGroup';
import { PageFormHidden } from '@ansible/ansible-ui-framework/PageForm/Utils/PageFormHidden';
import { awxErrorAdapter } from '@ansible/awx-ui/common/adapters/awxErrorAdapter';
import { awxAPI } from '@ansible/awx-ui/common/api/awx-utils';
import { useAwxConfig, useAwxConfigState } from '@ansible/awx-ui/common/useAwxConfig';
import { postRequest, requestPatch } from '@ansible/common-ui/crud/Data';
import { ILicenseInfo } from '@ansible/common-ui/interfaces/Config';
import { ExternalLink } from '@ansible/hub-ui//common/ExternalLink';
import {
  Content,
  Divider,
  ProgressStep,
  ProgressStepper,
  Stack,
  Title,
} from '@patternfly/react-core';
import { useCallback, useEffect, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

interface SubscriptionWizardData {
  subscriptionSelection: 'manifest' | 'service_account' | 'username' | 'satellite';
  subscriptionFile: File;
  client_id: string;
  client_secret: string;
  username: string;
  password: string;
  satellite_username: string;
  satellite_password: string;
  subscription_id?: string;
  agree: boolean;
}

export function SubscriptionWizard(props: Readonly<{ onSuccess: () => void }>) {
  const { t } = useTranslation();
  const { refreshAwxConfig } = useAwxConfigState();

  const steps = useMemo(() => {
    const steps: PageWizardStep[] = [
      {
        id: 'subscription',
        label: t('Ansible Automation Platform Subscription'),
        inputs: <SubscriptionStep />,
      },
      {
        id: 'license-agreement',
        label: t('End User License Agreement'),
        inputs: <LicenseAgreementStep />,
      },
      {
        id: 'review',
        label: t('Review'),
        element: <LicenseReviewStep />,
      },
    ];
    return steps;
  }, [t]);

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
        case 'service_account':
        case 'username':
        case 'satellite':
          await postRequest(awxAPI`/config/attach/`, {
            subscription_id: data.subscription_id,
          });
          await requestPatch(awxAPI`/settings/all/`, {
            INSIGHTS_TRACKING_STATE: true,
          });
          break;
      }
      refreshAwxConfig?.();
      props.onSuccess();
    },
    [props, refreshAwxConfig]
  );

  return (
    <PageWizard<SubscriptionWizardData>
      steps={steps}
      onSubmit={onSubmit}
      errorAdapter={awxErrorAdapter}
      singleColumn
    />
  );
}

function SubscriptionStep() {
  const { t } = useTranslation();
  const { setValue, watch } = useFormContext<SubscriptionWizardData>();
  const clientId = watch('client_id');
  const clientSecret = watch('client_secret');
  const username = watch('username');
  const password = watch('password');
  const satelliteUsername = watch('satellite_username');
  const satellitePassword = watch('satellite_password');
  useEffect(
    () => setValue('subscription_id', undefined),
    [clientId, clientSecret, username, password, satelliteUsername, satellitePassword, setValue]
  );
  const querySubscriptions = useCallback(async () => {
    const subscriptions = await postRequest<ILicenseInfo[]>(awxAPI`/config/subscriptions/`, {
      subscriptions_client_id: clientId,
      subscriptions_client_secret: clientSecret,
      subscriptions_username: username || satelliteUsername,
      subscriptions_password: password || satellitePassword,
    });
    return {
      remaining: 0,
      options:
        subscriptions.map((subscription) => {
          const expires = new Date(subscription.license_date * 1000);
          return {
            label: subscription.subscription_name,
            value: subscription.subscription_id,
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
  }, [clientId, clientSecret, username, satelliteUsername, password, satellitePassword, t]);

  return (
    <>
      <Content>
        <Content component="h1">{t('Welcome to Red Hat Ansible Automation Platform!')}</Content>
        <Content component="p">
          {t('Please complete the steps below to activate your subscription.')}
        </Content>
        <Content component="p">
          {t('If you do not have a subscription, you can visit Red Hat to obtain a ')}
          <ExternalLink href="https://www.ansible.com/license">
            {t('trial subscription')}
          </ExternalLink>
        </Content>
      </Content>
      <Divider />
      <Content>
        <Content component="h4">
          {t('Select one of the following methods to add your subscription.')}
        </Content>
      </Content>
      <PageFormToggleGroup<SubscriptionWizardData>
        name="subscriptionSelection"
        options={[
          { value: 'manifest', label: 'Subscription manifest' },
          { value: 'service_account', label: 'Service Account' },
          { value: 'username', label: 'Username and Password' },
          { value: 'satellite', label: 'Red Hat Satellite' },
        ]}
      />
      <PageFormHidden
        watch="subscriptionSelection"
        hidden={(subscriptionSelection) => subscriptionSelection !== 'manifest'}
      >
        <Content>
          <Content component="p">
            {t(
              'Upload a Red Hat Subscription Manifest containing your subscription. To generate your subscription manifest, go to '
            )}
            <ExternalLink href="https://access.redhat.com/management/subscription_allocations">
              {t('subscription allocations')}
            </ExternalLink>
            {t(' on the Red Hat Customer Portal.')}
          </Content>
        </Content>
        <PageFormFileUpload
          name="subscriptionFile"
          label={t('Red Hat subscription manifest')}
          isRequired
          validate={(file: File) => {
            if (!file.name.endsWith('.zip')) return t('File must be a .zip file');
          }}
        />
      </PageFormHidden>
      <PageFormHidden
        watch="subscriptionSelection"
        hidden={(subscriptionSelection) => subscriptionSelection !== 'service_account'}
      >
        <Content>
          <Content component="p">
            {t(
              'Provide your service account credentials below and you can choose from a list of your available subscriptions. The credentials you use will be stored for future use in retrieving renewal or expanded subscriptions. Service accounts credentials can be found '
            )}
            <a
              href="https://console.redhat.com/iam/service-accounts"
              target="_blank"
              rel="noreferrer"
            >
              {t('here on console.redhat.com')}
            </a>
            {t('.')}
          </Content>
        </Content>
        <PageFormTextInput<SubscriptionWizardData>
          name="client_id"
          label={t`Client ID`}
          isRequired
        />
        <PageFormTextInput<SubscriptionWizardData>
          name="client_secret"
          label={t`Client secret`}
          type="password"
          isRequired
        />
        <PageFormAsyncSingleSelect<SubscriptionWizardData>
          name="subscription_id"
          label={t('Subscription')}
          queryOptions={querySubscriptions}
          queryErrorText={t('Failed to load subscriptions. Check your credentials.')}
          placeholder={t('Select your subscription')}
          queryLabel={(subscription_id) => subscription_id?.toString()}
          isRequired
          isDisabled={
            !clientId || !clientSecret
              ? t('Enter your credentials to load subscriptions.')
              : undefined
          }
        />
      </PageFormHidden>
      <PageFormHidden
        watch="subscriptionSelection"
        hidden={(subscriptionSelection) => subscriptionSelection !== 'username'}
      >
        <Content>
          <Content component="p">
            {t(
              'Provide your Red Hat credentials below and you can choose from a list of your available subscriptions. The credentials you use will be stored for future use in retrieving renewal or expanded subscriptions.'
            )}
          </Content>
        </Content>
        <PageFormTextInput<SubscriptionWizardData> name="username" label={t`Username`} isRequired />
        <PageFormTextInput<SubscriptionWizardData>
          name="password"
          label={t`Password`}
          type="password"
          isRequired
        />
        <PageFormAsyncSingleSelect<SubscriptionWizardData>
          name="subscription_id"
          label={t('Subscription')}
          queryOptions={querySubscriptions}
          queryErrorText={t('Failed to load subscriptions. Check your credentials.')}
          placeholder={t('Select your subscription')}
          queryLabel={(subscription_id) => subscription_id?.toString()}
          isRequired
          isDisabled={
            !username || !password ? t('Enter your credentials to load subscriptions.') : undefined
          }
        />
      </PageFormHidden>
      <PageFormHidden
        watch="subscriptionSelection"
        hidden={(subscriptionSelection) => subscriptionSelection !== 'satellite'}
      >
        <Content>
          <Content component="p">
            {t(
              'Provide your Red Hat Satellite credentials below and you can choose from a list of your available subscriptions. The credentials you use will be stored for future use in retrieving renewal or expanded subscriptions.'
            )}
          </Content>
        </Content>
        <PageFormTextInput<SubscriptionWizardData>
          name="satellite_username"
          label={t`Red Hat Satellite username`}
          isRequired
        />
        <PageFormTextInput<SubscriptionWizardData>
          name="satellite_password"
          label={t`Red Hat Satellite password`}
          type="password"
          isRequired
        />
        <PageFormAsyncSingleSelect<SubscriptionWizardData>
          name="subscription_id"
          label={t('Subscription')}
          queryOptions={querySubscriptions}
          queryErrorText={t('Failed to load subscriptions. Check your credentials.')}
          placeholder={t('Select your subscription')}
          queryLabel={(subscription_id) => subscription_id?.toString()}
          isRequired
          isDisabled={
            !satelliteUsername || !satellitePassword
              ? t('Enter your credentials to load subscriptions.')
              : undefined
          }
        />
      </PageFormHidden>
    </>
  );
}

function LicenseAgreementStep() {
  const { t } = useTranslation();
  const config = useAwxConfig();
  return (
    <>
      <Content>
        {config?.eula.split('\n').map((line, index) => (
          <Content key={index} component="p">
            {line}
          </Content>
        ))}
      </Content>
      <PageFormCheckbox<SubscriptionWizardData>
        name="agree"
        label={t('I agree to the terms of the license agreement')}
        isRequired
      />
    </>
  );
}

function LicenseReviewStep() {
  const { t } = useTranslation();
  return (
    <Stack hasGutter>
      <Content>
        <Title headingLevel="h1" size="2xl">
          {t('Review')}
        </Title>
      </Content>
      <ProgressStepper isVertical>
        <ProgressStep variant="success">{t('Subscription')}</ProgressStep>
        <ProgressStep variant="success">{t('Agreement')}</ProgressStep>
      </ProgressStepper>
    </Stack>
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
