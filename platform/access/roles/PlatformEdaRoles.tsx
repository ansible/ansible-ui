import { EdaRolesTable } from '@ansible/eda-ui/access/roles/EdaRoles';
import { Alert } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';

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
      />
      <EdaRolesTable />
    </>
  );
}
