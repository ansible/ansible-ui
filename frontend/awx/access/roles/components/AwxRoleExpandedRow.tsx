import { useGet } from '@ansible/common-ui/crud/useGet';
import { ExpandableRowContent } from '@patternfly/react-table';
import { useTranslation } from 'react-i18next';
import { awxAPI } from '../../../common/api/awx-utils';
import { AwxRbacRole } from '../../../interfaces/AwxRbacRole';
import { AwxRolePermissions } from './AwxRolePermissions';

interface AwxRoleExpandedRowProps {
  role: AwxRbacRole;
}

export function AwxRoleExpandedRow(props: AwxRoleExpandedRowProps) {
  const { t } = useTranslation();
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
