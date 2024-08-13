import { ExpandableRowContent } from '@patternfly/react-table';
import { HubRolePermissions } from './HubRolePermissions';
import { HubRbacRole } from '../../../interfaces/expanded/HubRbacRole';
import { useGet } from '../../../../common/crud/useGet';
import { hubAPI } from '../../../common/api/formatPath';
import { useTranslation } from 'react-i18next';

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
