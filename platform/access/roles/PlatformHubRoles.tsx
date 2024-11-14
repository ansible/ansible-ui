import { HubRolesTable } from '@ansible/hub-ui/access/roles/HubRoles';
import { Alert } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';

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
      />
      <HubRolesTable />
    </>
  );
}
