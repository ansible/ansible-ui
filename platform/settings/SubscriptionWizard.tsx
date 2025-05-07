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
  Alert,
  Divider,
  ProgressStep,
  ProgressStepper,
  Stack,
  Text,
  TextContent,
  Title,
} from '@patternfly/react-core';
import { t } from 'i18next';
import { useCallback, useEffect, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';

interface SubscriptionWizardData {
  subscriptionSelection: 'manifest' | 'username';
  subscriptionFile: File;
  client_id: string;
  client_secret: string;
  subscription_id?: string;
  agree: boolean;
}

export function SubscriptionWizard(props: { onSuccess: () => void }) {
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
          await postRequest(awxAPI`/config/attach/`, {
            subscription_id: data.subscription_id,
          });
          break;
      }
      refreshAwxConfig?.();
      await requestPatch(awxAPI`/settings/system/`, {
        INSIGHTS_TRACKING_STATE: true, // Default to true
      });
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
  const { setValue, watch } = useFormContext<SubscriptionWizardData>();
  const clientId = watch('client_id');
  const clientSecret = watch('client_secret');
  useEffect(() => setValue('subscription_id', undefined), [clientId, clientSecret, setValue]);
  const querySubscriptions = useCallback(async () => {
    const subscriptions = await postRequest<ILicenseInfo[]>(awxAPI`/config/subscriptions/`, {
      subscriptions_client_id: clientId,
      subscriptions_client_secret: clientSecret,
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
  }, [clientSecret, clientId]);

  return (
    <>
      <TextContent>
        <Text component="h1">{t('Welcome to Red Hat Ansible Automation Platform!')}</Text>
        <Text component="p">
          {t('Please complete the steps below to activate your subscription.')}
        </Text>
        <Text component="p">
          {t('If you do not have a subscription, you can visit Red Hat to obtain a ')}
          <ExternalLink href="https://www.ansible.com/license">
            {t('trial subscription')}
          </ExternalLink>
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
          { value: 'username', label: 'Service Account / Red Hat Satellite' },
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
            <ExternalLink href="https://access.redhat.com/management/subscription_allocations">
              {t('subscription allocations')}
            </ExternalLink>
            {t(' on the Red Hat Customer Portal.')}
          </Text>
        </TextContent>
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
        hidden={(subscriptionSelection) => subscriptionSelection !== 'username'}
      >
        <TextContent>
          <Text component="p">
            {t(
              'Provide your Red Hat or Red Hat Satellite credentials below and you can choose from a list of your available subscriptions. The credentials you use will be stored for future use in retrieving renewal or expanded subscriptions.'
            )}
          </Text>
        </TextContent>
        <Alert
          variant="info"
          isInline
          title={t('Input client ID and client secret or username and password')}
        >
          <p>
            {t(
              'If you use any services on the Hybrid Cloud Console, service account credentials will be required to log in as of May 2025. You must '
            )}
            <a
              href="https://console.redhat.com/iam/service-accounts"
              target="_blank"
              rel="noreferrer"
            >
              {t('create a service account here')}
            </a>
            {t(
              ' and use the client ID and client secret to replace your username and password when logging in. For Red Hat Satellite, input your username and password in the fields below. Please see this '
            )}
            <a href="https://access.redhat.com/articles/7112649" target="_blank" rel="noreferrer">
              {t('Knowledgebase article')}
            </a>
            {t(' for more information.')}
          </p>
        </Alert>
        <PageFormTextInput<SubscriptionWizardData>
          name="client_id"
          label={t`Client ID / Satellite username`}
          isRequired
        />
        <PageFormTextInput<SubscriptionWizardData>
          name="client_secret"
          label={t`Client secret / Satellite password`}
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
    </>
  );
}

function LicenseAgreementStep() {
  const config = useAwxConfig();
  return (
    <>
      <TextContent>
        {config?.eula.split('\n').map((line, index) => (
          <Text key={index} component="p">
            {line}
          </Text>
        ))}
      </TextContent>
      <PageFormCheckbox<SubscriptionWizardData>
        name="agree"
        label={t('I agree to the terms of the license agreement')}
        isRequired
      />
    </>
  );
}

function LicenseReviewStep() {
  return (
    <Stack hasGutter>
      <TextContent>
        <Title headingLevel="h1" size="2xl">
          {t('Review')}
        </Title>
      </TextContent>
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
