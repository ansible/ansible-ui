import { Alert } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { ApplicationsTable } from '../../../frontend/awx/administration/applications/ApplicationsTable';

export function PlatformAwxApplications() {
  const { t } = useTranslation();
  // const awxRoles = useRolesMetadata();
  return (
    <>
      <Alert
        title={t(
          'These OAuth Applications only apply to resources in the context of automation execution.'
        )}
        variant="info"
        style={{ borderTop: 0 }}
        className="border-bottom"
        isInline
      />
      <ApplicationsTable />
    </>
  );
}
