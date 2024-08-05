import { useOutletContext } from 'react-router-dom';
import { PageDetail, Scrollable, useGetPageUrl } from '../../../../../framework';
import { PageDetails } from '../../../../../framework';
import { NotificationTemplate } from '../../../interfaces/NotificationTemplate';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AwxRoute } from '../../../main/AwxRoutes';
import { t } from 'i18next';
import { TextArea } from '@patternfly/react-core';
import { DateTimeCell } from '../../../../../framework';
import { usePageNavigate } from '../../../../../framework';
import { StatusLabel } from '../../../../common/Status';
import { getLabelHelp } from '../NotifierFormInner';

export function NotificationDetails() {
  const { t } = useTranslation();
  const { notificationTemplate, runningTest } = useOutletContext<{
    notificationTemplate: NotificationTemplate;
    runningTest: boolean;
  }>();
  const getPageUrl = useGetPageUrl();
  const pageNavigate = usePageNavigate();

  const status =
    notificationTemplate.summary_fields.recent_notifications.length > 0
      ? notificationTemplate.summary_fields.recent_notifications[0].status
      : '';
  return (
    <>
      <Scrollable>
        <PageDetails disableScroll={true}>
          <PageDetail label={t('Name')}>{notificationTemplate.name}</PageDetail>
          <PageDetail label={t('Description')}>{notificationTemplate.description}</PageDetail>
          {status && (
            <PageDetail label={t('Status')}>
              {runningTest === false && <StatusLabel status={status} />}
              {runningTest === true && <StatusLabel status={'running'} />}
            </PageDetail>
          )}
          <PageDetail label={t('Created')}>
            <DateTimeCell
              value={notificationTemplate.created}
              author={notificationTemplate.summary_fields?.created_by?.username}
              onClick={() =>
                pageNavigate(AwxRoute.UserDetails, {
                  params: { id: notificationTemplate.summary_fields?.created_by?.id },
                })
              }
            />
          </PageDetail>
          <PageDetail label={t('Last modified')}>
            <DateTimeCell
              value={notificationTemplate.modified}
              author={notificationTemplate.summary_fields?.modified_by?.username}
              onClick={() =>
                pageNavigate(AwxRoute.UserDetails, {
                  params: { id: notificationTemplate.summary_fields?.modified_by?.id },
                })
              }
            />
          </PageDetail>

          <PageDetail label={t('Organization')}>
            <Link
              to={getPageUrl(AwxRoute.OrganizationDetails, {
                params: { id: notificationTemplate.summary_fields.organization.id },
              })}
            >
              {notificationTemplate.summary_fields.organization.name}
            </Link>
          </PageDetail>
          <PageDetail label={t('Notification type')}>
            {notificationTemplate.notification_type}
          </PageDetail>

          <RenderInnerDetail notificationTemplate={notificationTemplate} />
        </PageDetails>
        {notificationTemplate.messages && (
          <RenderMessages notificationTemplate={notificationTemplate} />
        )}
      </Scrollable>
    </>
  );
}

function RenderMessages(props: { notificationTemplate: NotificationTemplate }) {
  const messages = props.notificationTemplate.messages;
  return (
    <>
      <PageDetails numberOfColumns="single" disableScroll={true}>
        {messages?.started?.message && (
          <PageDetail label={t('Start message')}>{messages?.started?.message}</PageDetail>
        )}

        {messages?.started?.body && (
          <PageDetail label={t('Start message body')}>{messages?.started?.body}</PageDetail>
        )}

        {messages?.success?.message && (
          <PageDetail label={t('Success message')}>{messages?.success?.message}</PageDetail>
        )}

        {messages?.success?.body && (
          <PageDetail label={t('Success message body')}>{messages?.success?.body}</PageDetail>
        )}

        {messages?.error?.message && (
          <PageDetail label={t('Error message')}>{messages?.error?.message}</PageDetail>
        )}

        {messages?.error?.body && (
          <PageDetail label={t('Error message body')}>{messages?.error?.body}</PageDetail>
        )}

        {messages?.workflow_approval?.approved?.message && (
          <PageDetail label={t('Workflow approved message')}>
            {messages?.workflow_approval?.approved?.message}
          </PageDetail>
        )}

        {messages?.workflow_approval?.approved?.body && (
          <PageDetail label={t('Workflow approved message body')}>
            {messages?.workflow_approval?.approved?.body}
          </PageDetail>
        )}

        {messages?.workflow_approval?.denied?.message && (
          <PageDetail label={t('Workflow denied message')}>
            {messages?.workflow_approval?.denied?.message}
          </PageDetail>
        )}

        {messages?.workflow_approval?.denied?.body && (
          <PageDetail label={t('Workflow denied message body')}>
            {messages?.workflow_approval?.denied?.body}
          </PageDetail>
        )}

        {messages?.workflow_approval?.running?.message && (
          <PageDetail label={t('Workflow pending message')}>
            {messages?.workflow_approval?.running?.message}
          </PageDetail>
        )}

        {messages?.workflow_approval?.running?.body && (
          <PageDetail label={t('Workflow pending message body')}>
            {messages?.workflow_approval?.running?.body}
          </PageDetail>
        )}

        {messages?.workflow_approval?.timed_out?.message && (
          <PageDetail label={t('Workflow timed out message')}>
            {messages?.workflow_approval?.timed_out?.message}
          </PageDetail>
        )}

        {messages?.workflow_approval?.timed_out?.body && (
          <PageDetail label={t('Workflow timed out message body')}>
            {messages?.workflow_approval?.timed_out?.body}
          </PageDetail>
        )}
      </PageDetails>
    </>
  );
}

function RenderInnerDetail(props: { notificationTemplate: NotificationTemplate }) {
  const { notificationTemplate } = props;
  return (
    <>
      {Object.keys(notificationTemplate.notification_configuration || {}).map((key) => {
        try {
          let value = notificationTemplate.notification_configuration[key] as
            | string
            | string[]
            | { [key: string]: unknown };

          let object = false;
          let list = false;
          if (Array.isArray(value)) {
            list = true;
            value = value.join('\n');
          } else {
            if (typeof value === 'object') {
              value = JSON.stringify(value, undefined, 2);
              object = true;
            }
          }

          if (value === undefined) {
            value = '';
          }

          // this is password field which should be hidden
          if (value === '$encrypted$') {
            return <></>;
          }

          let caption = returnCaption(notificationTemplate.notification_type, key);

          if (!caption) {
            caption = key;
          }

          // label help
          const labelHelp = getLabelHelp(notificationTemplate.notification_type || '', key, t);

          if (!list && !object) {
            return (
              <PageDetail key={key} label={caption} helpText={labelHelp}>
                {value.toString()}
              </PageDetail>
            );
          } else {
            return (
              <PageDetail key={key} label={caption} helpText={labelHelp}>
                <TextArea value={value.toString()} contentEditable={false} rows={3} />
              </PageDetail>
            );
          }
        } catch (err) {
          return (
            <PageDetail key={key} label={key}>
              {t('Error displaying field')}
            </PageDetail>
          );
        }
      })}
    </>
  );
}

function returnCaption(notification_type: string | null, key: string) {
  if (notification_type === 'email') {
    if (key === 'username') return t('Username');
    if (key === 'password') return t('Password');
    if (key === 'host') return t('Host');
    if (key === 'recipients') return t('Recipient list');
    if (key === 'sender') return t('Sender email');
    if (key === 'port') return t('Port');
    if (key === 'timeout') return t('Timeout');
    if (key === 'use_tls') return t('Use TLS');
    if (key === 'use_ssl') return t('Use SSL');
  }

  if (notification_type === 'slack') {
    if (key === 'token') return t('Token');
    if (key === 'channels') return t('Destination Channels');
    if (key === 'hex_color') return t('Notification color');
  }

  if (notification_type === 'twilio') {
    if (key === 'account_sid') return t('Account SID');
    if (key === 'account_token') return t('Account Token');
    if (key === 'from_number') return t('Source Phone Number');
    if (key === 'to_numbers') return t('Destination SMS Numbers');
  }

  if (notification_type === 'pagerduty') {
    if (key === 'subdomain') return t('Pagerduty subdomain');
    if (key === 'service_key') return t('API Service/Integration Key');
    if (key === 'client_name') return t('Client Identifier');
  }

  if (notification_type === 'grafana') {
    if (key === 'grafana_url') return t('Grafana URL');
    if (key === 'grafana_key') return t('Grafana API Key');
    if (key === 'dashboardId') return t('ID of the dashboard (optional)');
    if (key === 'panelId') return t('ID of the panel (optional)');
    if (key === 'annotation_tags') return t('Tags for the annotation (optional)');
    if (key === 'grafana_no_verify_ssl') return t('Disable SSL verification');
  }

  if (notification_type === 'webhook') {
    if (key === 'username') return t('Username');
    if (key === 'password') return t('Basic auth password');
    if (key === 'url') return t('Target URL');
    if (key === 'disable_ssl_verification') return t('Disable SSL verification ');
    if (key === 'http_method') return t('HTTP Method');
    if (key === 'headers') return t('Headers');
  }

  if (notification_type === 'mattermost') {
    if (key === 'mattermost_url') return t('Target URL');
    if (key === 'mattermost_username') return t('Username');
    if (key === 'mattermost_channel') return t('Channel');
    if (key === 'mattermost_icon_url') return t('Icon URL');
    if (key === 'mattermost_no_verify_ssl') return t('Verify SSL');
  }

  if (notification_type === 'rocketchat') {
    if (key === 'rocketchat_url') return t('Target URL');
    if (key === 'rocketchat_username') return t('Username');
    if (key === 'rocketchat_icon_url') return t('Icon URL');
    if (key === 'rocketchat_no_verify_ssl') return t('Disable SSL verification');
  }

  if (notification_type === 'irc') {
    if (key === 'server') return t('IRC Server Address');
    if (key === 'nickname') return t('IRC Nick');
    if (key === 'targets') return t('Destination Channels or Users');
    if (key === 'password') return t('IRC Server Password');
    if (key === 'port') return t('IRC Server Port');
    if (key === 'use_ssl') return t('Disable SSL verification ');
  }

  return '';
}
