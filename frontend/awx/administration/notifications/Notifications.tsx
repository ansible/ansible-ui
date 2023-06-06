import { useTranslation } from 'react-i18next';
import {
  PageHeader,
  PageLayout,
} from '../../../../framework';
import getDocsBaseUrl from '../../common/util/getDocsBaseUrl';
import { useAwxConfig } from '../../common/useAwxConfig';
import { PageNotImplemented } from '../../../common/PageNotImplemented';

export function Notifications() {
  const { t } = useTranslation();
  const config = useAwxConfig();

  return (
    <PageLayout>
      <PageHeader
        title={t('Notifications')}
        description={t(
          'Configure custom notifications to be sent based on predefined events.'
        )}
        titleHelpTitle={t('Notifications')}
        titleHelp={t(
          'Configure custom notifications to be sent based on predefined events.'
        )}
        titleDocLink={`${getDocsBaseUrl(config)}/html/userguide/notifications.html`}
      />
      <PageNotImplemented />
    </PageLayout>
  );
}