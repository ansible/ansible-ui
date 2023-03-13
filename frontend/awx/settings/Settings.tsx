import { Fragment, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../../framework';
import { RouteObj } from '../../Routes';

export default function Settings() {
  const { t } = useTranslation();
  const breadcrumbs = useMemo(
    () => [{ label: 'Dashboard', to: RouteObj.Dashboard }, { label: 'Settings' }],
    []
  );
  return (
    <Fragment>
      <PageHeader title={t('Settings')} breadcrumbs={breadcrumbs} />
    </Fragment>
  );
}
