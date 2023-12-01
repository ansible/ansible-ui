import { Alert } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { EdaRolesTable } from '../../../frontend/eda/UserAccess/Roles/Roles';

export function PlatformEdaRoles() {
  const { t } = useTranslation();
  return (
    <>
      <Alert
        title={t('These roles only apply to resources in the context of automation decisions.')}
        variant="info"
        style={{ borderTop: 0 }}
        className="border-bottom"
        isInline
      ></Alert>
      <EdaRolesTable />
    </>
  );
}
