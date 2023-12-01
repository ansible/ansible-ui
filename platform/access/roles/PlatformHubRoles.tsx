import { Alert } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { HubRolesTable } from '../../../frontend/hub/access/roles/Roles';

export function PlatformHubRoles() {
  const { t } = useTranslation();
  return (
    <>
      <Alert
        title={t('These roles only apply to resources in the context of automation content.')}
        variant="info"
        style={{ borderTop: 0 }}
        className="border-bottom"
        isInline
      ></Alert>
      <HubRolesTable />
    </>
  );
}
