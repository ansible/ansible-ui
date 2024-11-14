import { AwxRolesTable } from '@ansible/awx-ui/access/roles/AwxRoles';
import { Alert } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';

export function PlatformAwxRoles() {
  const { t } = useTranslation();
  // const awxRoles = useRolesMetadata();
  return (
    <>
      <Alert
        title={t('These roles only apply to resources in the context of automation execution.')}
        variant="info"
        style={{ borderTop: 0 }}
        className="border-bottom"
        isInline
      />
      <AwxRolesTable />
    </>
  );
}
