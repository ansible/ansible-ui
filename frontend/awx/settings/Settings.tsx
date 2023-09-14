import { Fragment, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../../framework';
import { useGetPageUrl } from '../../../framework/PageNavigation/useGetPageUrl';
import { AwxRoute } from '../AwxRoutes';

export default function Settings() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const breadcrumbs = useMemo(
    () => [{ label: 'Dashboard', to: getPageUrl(AwxRoute.Dashboard) }, { label: 'Settings' }],
    [getPageUrl]
  );
  return (
    <Fragment>
      <PageHeader title={t('Settings')} breadcrumbs={breadcrumbs} />
    </Fragment>
  );
}
