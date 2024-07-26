/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Trans, useTranslation } from 'react-i18next';

import {
  PageFormCheckbox,
  PageFormDataEditor,
  PageFormTextArea,
  PageFormTextInput,
} from '../../../../framework';

import { NotificationTemplate } from '../../interfaces/NotificationTemplate';

import { PageFormSingleSelect } from '../../../../framework/PageForm/Inputs/PageFormSingleSelect';
import { PageFormGroup } from '../../../../framework/PageForm/Inputs/PageFormGroup';
import { TFunction } from 'i18next';
import { FieldPathByValue } from 'react-hook-form';

export function InnerForm(props: { notification_type: string }) {
  const notification_type = props.notification_type;
  if (notification_type === 'email') {
    return <EmailForm />;
  }

  if (notification_type === 'slack') {
    return <SlackForm />;
  }

  if (notification_type === 'twilio') {
    return <TwilioForm />;
  }

  if (notification_type === 'pagerduty') {
    return <PagerdutyForm />;
  }

  if (notification_type === 'grafana') {
    return <GrafanaForm />;
  }

  if (notification_type === 'webhook') {
    return <WebhookForm />;
  }

  if (notification_type === 'mattermost') {
    return <MattermostForm />;
  }

  if (notification_type === 'rocketchat') {
    return <RocketchatForm />;
  }

  if (notification_type === 'irc') {
    return <IrcForm />;
  }

  return <></>;
}

function EmailForm() {
  const { t } = useTranslation();
  return (
    <>
      <PageFormTextInput<NotificationTemplate>
        type={'text'}
        name={'notification_configuration.username'}
        label={t('Username')}
      />

      <PageFormTextInput<NotificationTemplate>
        type={'password'}
        name={'notification_configuration.password'}
        label={t('Password')}
      />

      <PageFormTextInput<NotificationTemplate>
        type={'text'}
        name={'notification_configuration.host'}
        label={t('Host')}
        isRequired
      />

      <PageFormTextArea<NotificationTemplate>
        name={'notification_configuration.recipients'}
        label={t('Recipient list')}
        isRequired
        labelHelp={getLabelHelp('email', 'recipients', t)}
      />

      <PageFormTextInput<NotificationTemplate>
        type={'text'}
        name={'notification_configuration.sender'}
        label={t('Sender email')}
        isRequired
        validate={(value) => validateEmail(value, t)}
      />

      <PageFormTextInput<NotificationTemplate>
        type={'number'}
        name={'notification_configuration.port'}
        label={t('Port')}
        isRequired
        validate={(value) => validateNumber(value, 1, 65535, t)}
      />

      <PageFormTextInput<NotificationTemplate>
        type={'number'}
        name={'notification_configuration.timeout'}
        label={t('Timeout')}
        isRequired
        validate={(value) => validateNumber(value, 1, 120, t)}
        labelHelp={getLabelHelp('email', 'timeout', t)}
      />

      <PageFormGroup
        label={t('Email options ')}
        labelHelp={
          <Trans>
            See Django{' '}
            <a href="https://docs.djangoproject.com/en/4.0/ref/settings/#std:setting-EMAIL_USE_TLS">
              documentation
            </a>{' '}
            for more information.
          </Trans>
        }
      >
        <PageFormCheckbox<NotificationTemplate>
          name={'notification_configuration.use_tls'}
          label={t('Use TLS')}
        />

        <PageFormCheckbox<NotificationTemplate>
          name={'notification_configuration.use_ssl'}
          label={t('Use SSL')}
        />
      </PageFormGroup>
    </>
  );
}

function SlackForm() {
  const { t } = useTranslation();
  return (
    <>
      <PageFormTextInput<NotificationTemplate>
        type={'password'}
        name={'notification_configuration.token'}
        label={t('Token')}
        isRequired
      />

      <PageFormTextArea<NotificationTemplate>
        name={'notification_configuration.channels'}
        label={t('Destination channels')}
        isRequired
        labelHelp={getLabelHelp('slack', 'channels', t)}
      />

      <PageFormTextInput<NotificationTemplate>
        name={'notification_configuration.hex_color'}
        label={t('Notification color')}
        labelHelp={getLabelHelp('slack', 'hex_color', t)}
      />
    </>
  );
}

function TwilioForm() {
  const { t } = useTranslation();
  return (
    <>
      <PageFormTextInput<NotificationTemplate>
        type={'text'}
        name={'notification_configuration.account_sid'}
        label={t('Account SID')}
        isRequired
      />

      <PageFormTextInput<NotificationTemplate>
        type={'password'}
        name={'notification_configuration.account_token'}
        label={t('Account token')}
        isRequired
      />

      <PageFormTextInput<NotificationTemplate>
        type={'text'}
        name={'notification_configuration.from_number'}
        label={t('Source phone number')}
        validate={(value) => twilioPhoneNumber(value, t)}
        isRequired
        labelHelp={getLabelHelp('twilio', 'from_number', t)}
      />

      <PageFormTextArea<NotificationTemplate>
        name={'notification_configuration.to_numbers'}
        label={t('Destination SMS numbers')}
        validate={(value) => twilioPhoneNumber(value, t)}
        labelHelp={getLabelHelp('twilio', 'to_numbers', t)}
        isRequired
      />
    </>
  );
}

function PagerdutyForm() {
  const { t } = useTranslation();
  return (
    <>
      <PageFormTextInput<NotificationTemplate>
        type={'text'}
        name={'notification_configuration.subdomain'}
        label={t('Pagerduty subdomain')}
        isRequired
      />

      <PageFormTextInput<NotificationTemplate>
        type={'password'}
        name={'notification_configuration.token'}
        label={t('API token')}
        isRequired
      />

      <PageFormTextInput<NotificationTemplate>
        type={'text'}
        name={'notification_configuration.service_key'}
        label={t('API service/integration key')}
        isRequired
      />

      <PageFormTextInput<NotificationTemplate>
        type={'text'}
        name={'notification_configuration.client_name'}
        label={t('Client identifier')}
        isRequired
      />
    </>
  );
}

function GrafanaForm() {
  const { t } = useTranslation();
  return (
    <>
      <PageFormTextInput<NotificationTemplate>
        type={'text'}
        name={'notification_configuration.grafana_url'}
        label={t('Grafana URL')}
        labelHelp={getLabelHelp('grafana', 'grafana_url', t)}
        isRequired
      />

      <PageFormTextInput<NotificationTemplate>
        type={'password'}
        name={'notification_configuration.grafana_key'}
        label={t('Grafana API key')}
        isRequired
      />

      <PageFormTextInput<NotificationTemplate>
        name={'notification_configuration.dashboardId'}
        label={t('ID of the dashboard (optional)')}
      />

      <PageFormTextInput<NotificationTemplate>
        name={'notification_configuration.panelId'}
        label={t('ID of the panel (optional)')}
      />

      <PageFormTextArea<NotificationTemplate>
        name={'notification_configuration.annotation_tags'}
        label={t('Tags for the annotation (optional)')}
        labelHelp={getLabelHelp('grafana', 'annotation_tags', t)}
      />

      <PageFormCheckbox<NotificationTemplate>
        name={'notification_configuration.grafana_no_verify_ssl'}
        label={t('Disable SSL verification')}
      />
    </>
  );
}

function WebhookForm() {
  const { t } = useTranslation();
  const headersPath = 'notification_configuration.headers' as FieldPathByValue<
    NotificationTemplate,
    string | object | null | undefined
  >;

  return (
    <>
      <PageFormTextInput<NotificationTemplate>
        type={'text'}
        name={'notification_configuration.username'}
        label={t('Username')}
      />

      <PageFormTextInput<NotificationTemplate>
        type={'password'}
        name={'notification_configuration.password'}
        label={t('Basic auth password')}
      />

      <PageFormTextInput<NotificationTemplate>
        type={'text'}
        name={'notification_configuration.url'}
        label={t('Target URL')}
        isRequired
        validate={(item) => validateUrl(item, t)}
      />

      <PageFormCheckbox<NotificationTemplate>
        name={'notification_configuration.disable_ssl_verification'}
        label={t('Disable SSL verification ')}
      />

      <PageFormDataEditor<NotificationTemplate>
        name={headersPath}
        label={t('HTTP headers')}
        format="object"
        labelHelp={getLabelHelp('webhook', 'headers', t)}
        labelHelpTitle={t('HTTP headers')}
      />

      <PageFormSingleSelect<NotificationTemplate>
        name={'notification_configuration.http_method'}
        label={t('HTTP method')}
        placeholder={t('Choose an HTTP method')}
        isRequired
        options={[
          { label: 'POST', value: 'POST' },
          { label: 'PUT', value: 'PUT' },
        ]}
      />
    </>
  );
}

function MattermostForm() {
  const { t } = useTranslation();

  return (
    <>
      <PageFormTextInput<NotificationTemplate>
        type={'text'}
        name={'notification_configuration.mattermost_url'}
        label={t('Target URL')}
        isRequired
        validate={(item) => validateUrl(item, t)}
      />

      <PageFormTextInput<NotificationTemplate>
        type={'text'}
        name={'notification_configuration.mattermost_username'}
        label={t('Username')}
      />

      <PageFormTextInput<NotificationTemplate>
        type={'text'}
        name={'notification_configuration.mattermost_channel'}
        label={t('Channel')}
      />

      <PageFormTextInput<NotificationTemplate>
        type={'text'}
        name={'notification_configuration.mattermost_icon_url'}
        label={t('Icon URL')}
        validate={(item) => validateUrl(item, t)}
      />

      <PageFormCheckbox<NotificationTemplate>
        name={'notification_configuration.mattermost_no_verify_ssl'}
        label={t('Verify SSL')}
      />
    </>
  );
}

function RocketchatForm() {
  const { t } = useTranslation();

  return (
    <>
      <PageFormTextInput<NotificationTemplate>
        type={'text'}
        name={'notification_configuration.rocketchat_url'}
        label={t('Target URL')}
        isRequired
        validate={(item) => validateUrl(item, t)}
      />

      <PageFormTextInput<NotificationTemplate>
        type={'text'}
        name={'notification_configuration.rocketchat_username'}
        label={t('Username')}
      />

      <PageFormTextInput<NotificationTemplate>
        type={'text'}
        name={'notification_configuration.rocketchat_icon_url'}
        label={t('Icon URL')}
        validate={(item) => validateUrl(item, t)}
      />

      <PageFormCheckbox<NotificationTemplate>
        name={'notification_configuration.rocketchat_no_verify_ssl'}
        label={t('Disable SSL verification')}
      />
    </>
  );
}

function IrcForm() {
  const { t } = useTranslation();
  return (
    <>
      <PageFormTextInput<NotificationTemplate>
        type={'password'}
        name={'notification_configuration.password'}
        label={t('IRC server password')}
      />

      <PageFormTextInput<NotificationTemplate>
        type="number"
        name={'notification_configuration.port'}
        label={t('IRC server port')}
        isRequired
      />

      <PageFormTextInput<NotificationTemplate>
        type={'text'}
        name={'notification_configuration.server'}
        label={t('IRC server address')}
        isRequired
        validate={(item) => validateUrl(item, t)}
      />

      <PageFormTextInput<NotificationTemplate>
        type={'text'}
        name={'notification_configuration.nickname'}
        label={t('IRC nick')}
        isRequired
      />

      <PageFormTextArea<NotificationTemplate>
        name={'notification_configuration.targets'}
        label={t('Destination channels or users')}
        isRequired
        labelHelp={getLabelHelp('irc', 'targets', t)}
      />

      <PageFormCheckbox<NotificationTemplate>
        name={'notification_configuration.use_ssl'}
        label={t('Disable SSL verification ')}
      />
    </>
  );
}

export function getLabelHelp(
  notification_type: string,
  key: string,
  t: TFunction<'translation', undefined>
) {
  if (notification_type === 'email' && key === 'recipients') {
    return t(
      'Use one email address per line to create a recipient list for this type of notification.'
    );
  }

  if (notification_type === 'email' && key === 'timeout') {
    return t(
      'The amount of time (in seconds) before the email notification stops trying to reach the host and times out. Ranges from 1 to 120 seconds.'
    );
  }

  if (notification_type === 'slack' && key === 'channels') {
    return (
      <Trans>
        One Slack channel per line. The pound symbol (#) is required for channels. To respond to or
        start a thread to a specific message add the parent message Id to the channel where the
        parent message Id is 16 digits. A dot (.) must be manually inserted after the 10th digit.
        ie:#destination-channel, 1231257890.006423. See Slack{' '}
        <a href="https://api.slack.com/messaging/retrieving#individual_messages">documentation</a>{' '}
        for more information.
      </Trans>
    );
  }

  if (notification_type === 'slack' && key === 'hex_color') {
    return t(
      'Specify a notification color. Acceptable colors are hex color code (example: #3af or #789abc).'
    );
  }

  if (notification_type === 'twilio' && key === 'from_number') {
    return t(
      'The number associated with the "Messaging Service" in Twilio with the format +18005550199.'
    );
  }

  if (notification_type === 'twilio' && key === 'to_numbers') {
    return t(
      'Use one phone number per line to specify where to route SMS messages. Phone numbers should be formatted +11231231234.'
    );
  }

  if (notification_type === 'grafana' && key === 'grafana_url') {
    return t(
      'The base URL of the Grafana server - the /api/annotations endpoint will be added automatically to the base Grafana URL.'
    );
  }

  if (notification_type === 'grafana' && key === 'annotation_tags') {
    return t('Use one Annotation Tag per line, without commas.');
  }

  if (notification_type === 'webhook' && key === 'headers') {
    return t(
      'Specify HTTP Headers in JSON or YAML format. Refer to the Ansible Controller documentation for example syntax.'
    );
  }

  if (notification_type === 'irc' && key === 'targets') {
    return t(
      'Use one IRC channel or username per line. The pound symbol (#) for channels, and the at (@) symbol for users, are not required.'
    );
  }

  return null;
}

function validateNumber(
  str: string,
  min: number,
  max: number,
  t: TFunction<'translation', undefined>
) {
  const val = Number.parseInt(str, 10);
  if (val >= min && val <= max) {
    return undefined;
  }

  return t('This field must be a number and have a value between {{min}} and {{max}}', {
    min,
    max,
  });
}

export function twilioPhoneNumber(value: string, t: TFunction<'translation', undefined>) {
  if (value === '') {
    return undefined;
  }

  const phoneNumbers = value?.split('\n');
  let error = undefined;

  phoneNumbers?.forEach((v) => {
    if (v === '') {
      return;
    }

    if (!/^\s*(?:\+?(\d{1,3}))?[. (]*(\d{7,12})$/.test(v)) {
      error = t('Please enter valid phone numbers.');
    }
  });
  return error;
}

function validateEmail(value: string, t: TFunction<'translation', undefined>) {
  // copied from old app to keep app consistent
  // This isn't a perfect validator. It's likely to let a few
  // invalid (though unlikely) email addresses through.

  // This is ok, because the server will always do strict validation for us.

  if (value === '') {
    return undefined;
  }
  const splitVals = value?.split('@');

  if (splitVals.length >= 2) {
    if (splitVals[0] && splitVals[1]) {
      // We get here if the string has an '@' that is enclosed by
      // non-empty substrings
      return undefined;
    }
  }

  return t('Invalid email address');
}

export function validateUrl(value: string, t: TFunction<'translation', undefined>) {
  if (!value) {
    return undefined;
  }
  // URL regex from https://urlregex.com/
  if (
    // eslint-disable-next-line max-len
    !/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www\.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w\-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[.!/\\\w]*))?)/.test(
      value
    )
  ) {
    return t`Please enter a valid URL`;
  }
  return undefined;
}
