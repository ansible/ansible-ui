import { useGet } from '@ansible/common-ui/crud/useGet';
import { ExpandableRowContent } from '@patternfly/react-table';
import { useTranslation } from 'react-i18next';
import { hubAPI } from '../../../common/api/formatPath';
import { HubRbacRole } from '../../../interfaces/expanded/HubRbacRole';
import { HubRolePermissions } from './HubRolePermissions';

interface HubRoleExpandedRowProps {
  role: HubRbacRole;
}
export function HubRoleExpandedRow(props: HubRoleExpandedRowProps) {
  const { t } = useTranslation();
  const { role } = props;

  const { data: roleDetails } = useGet<HubRbacRole>(
    hubAPI`/_ui/v2/role_definitions/${role.id?.toString() ?? ''}/`
  );

  if (!roleDetails) {
    return <ExpandableRowContent>{t('Loading...')}</ExpandableRowContent>;
  }

  return (
    <ExpandableRowContent>
      <HubRolePermissions role={roleDetails} />
    </ExpandableRowContent>
  );
}
