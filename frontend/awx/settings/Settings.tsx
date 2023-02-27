import { Fragment, useMemo } from 'react';
import { PageHeader } from '../../../framework';
import { RouteObj } from '../../Routes';

export default function Settings() {
  const breadcrumbs = useMemo(
    () => [{ label: 'Dashboard', to: RouteObj.Dashboard }, { label: 'Settings' }],
    []
  );
  return (
    <Fragment>
      <PageHeader title="Settings" breadcrumbs={breadcrumbs} />
    </Fragment>
  );
}
