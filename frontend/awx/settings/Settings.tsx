import { Fragment, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../../framework';
import { AwxRoute } from '../AwxRoutes';
import { useGetAwxUrl } from '../useAwxNavigate';

export default function Settings() {
  const { t } = useTranslation();
  const getAwxUrl = useGetAwxUrl();
  const breadcrumbs = useMemo(
    () => [{ label: 'Dashboard', to: getAwxUrl(AwxRoute.Dashboard) }, { label: 'Settings' }],
    [getAwxUrl]
  );
  return (
    <Fragment>
      <PageHeader title={t('Settings')} breadcrumbs={breadcrumbs} />
    </Fragment>
  );
}
