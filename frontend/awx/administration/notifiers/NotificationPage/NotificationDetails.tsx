import { useOutletContext } from 'react-router-dom';
import { PageDetail, useGetPageUrl } from '../../../../../framework';
import { PageDetails } from '../../../../../framework';
import { NotificationTemplate } from '../../../interfaces/NotificationTemplate';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AwxRoute } from '../../../main/AwxRoutes';
import { t } from 'i18next';

export function NotificationDetails() {
  const { t } = useTranslation();
  const { notificationTemplate } = useOutletContext<{
    notificationTemplate: NotificationTemplate;
  }>();
  const getPageUrl = useGetPageUrl();
  return (
    <>
      <PageDetails>
        <PageDetail label={t('Name')}>{notificationTemplate.name}</PageDetail>
        <PageDetail label={t('Description')}>{notificationTemplate.description}</PageDetail>
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
        let value = notificationTemplate.notification_configuration[key] as string | string[];

        let list = false;
        if (Array.isArray(value)) {
          list = true;
          value = value.join('\n');
        }

        const caption = capitalizeFirstLetter(key);

        if (value === undefined) {
          return <></>;
        }
        // dynamic access in t(key) is usualy bad, because then static analysis of translation strings
        // will not find it, but since those translations are in form, it is ok

        if (!list) {
          return <PageDetail label={t(caption)}>{value.toString()}</PageDetail>;
        } else {
          return <>TODO: list</>;
        }
      })}
    </>
  );
}

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}
