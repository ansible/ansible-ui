import { ExpandableRowContent } from '@patternfly/react-table';
import { useGet } from '../../../../common/crud/useGet';
import { awxAPI } from '../../../common/api/awx-utils';
import { AwxRbacRole } from '../../../interfaces/AwxRbacRole';
import { AwxRolePermissions } from './AwxRolePermissions';
import { t } from 'i18next';

interface AwxRoleExpandedRowProps {
  role: AwxRbacRole;
}

export function AwxRoleExpandedRow(props: AwxRoleExpandedRowProps) {
  const { role } = props;

  const { data: roleDetails } = useGet<AwxRbacRole>(
    awxAPI`/role_definitions/${role.id?.toString() ?? ''}/`
  );

  if (!roleDetails) {
    return <ExpandableRowContent>{t('Loading...')}</ExpandableRowContent>;
  }

  return (
    <ExpandableRowContent>
      <AwxRolePermissions role={roleDetails} />
    </ExpandableRowContent>
  );
}
