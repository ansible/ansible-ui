import { Alert } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { PlatformApplicationsTable } from './PlatformApplicationsTable';

export function PlatformGatewayApplications() {
  const { t } = useTranslation();
  // const awxRoles = useRolesMetadata();
  return (
    <>
      <Alert
        title={t('These OAuth Applications apply to resources at platform level.')}
        variant="info"
        style={{ borderTop: 0 }}
        className="border-bottom"
        isInline
      />
      <PlatformApplicationsTable />
    </>
  );
}
