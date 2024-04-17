import { useOutletContext } from 'react-router-dom';
import { PageDetail, useGetPageUrl } from '../../../../../framework';
import { PageDetails } from '../../../../../framework';
import { NotificationTemplate } from '../../../interfaces/NotificationTemplate';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AwxRoute } from '../../../main/AwxRoutes';
import { t } from 'i18next';
import { TextArea } from '@patternfly/react-core';
import { DateTimeCell } from '../../../../../framework';
import { usePageNavigate } from '../../../../../framework';

export function NotificationDetails() {
  const { t } = useTranslation();
  const { notificationTemplate } = useOutletContext<{
    notificationTemplate: NotificationTemplate;
  }>();
  const getPageUrl = useGetPageUrl();
  const pageNavigate = usePageNavigate();
  return (
    <>
      <PageDetails>
        <PageDetail label={t('Name')}>{notificationTemplate.name}</PageDetail>
        <PageDetail label={t('Description')}>{notificationTemplate.description}</PageDetail>
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
        <PageDetail label={t('Last Modified')}>
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
        <PageDetail label={t('Notification Type')}>
          {notificationTemplate.notification_type}
        </PageDetail>

        <RenderInnerDetail notificationTemplate={notificationTemplate} />
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
          let value = notificationTemplate.notification_configuration[key] as string | string[];

          let list = false;
          if (Array.isArray(value)) {
            list = true;
            value = value.join('\n');
          }

          if (value === undefined) {
            return <></>;
          }

          // this is password field which should be hidden
          if (value === '$encrypted$') {
            return <></>;
          }

          const caption = returnCaption(notificationTemplate.notification_type, key);

          if (!list) {
            return (
              <PageDetail key={key} label={caption}>
                {value.toString()}
              </PageDetail>
            );
          } else {
            return (
              <PageDetail key={key} label={caption}>
                <TextArea value={value} contentEditable={false} rows={3} />
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
    if (key === 'recipients') return t('Recipient List');
    if (key === 'sender') return t('Sender Email');
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
  }

  if (notification_type === 'mattermost') {
    if (key === 'url') return t('Target URL');
    if (key === 'username') return t('Username');
    if (key === 'channel') return t('Channel');
    if (key === 'icon_url') return t('Icon URL');
    if (key === 'no_verify_ssl') return t('Verify SSL');
  }

  if (notification_type === 'rocketchat') {
    if (key === 'url') return t('Target URL');
    if (key === 'username') return t('Username');
    if (key === 'icon_url') return t('Icon URL');
    if (key === 'no_verify_ssl') return t('Disable SSL verification');
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
