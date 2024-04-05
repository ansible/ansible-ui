import { ExpandableRowContent } from '@patternfly/react-table';
import { useGet } from '../../../../common/crud/useGet';
import { edaAPI } from '../../../common/eda-utils';
import { EdaRbacRole } from '../../../interfaces/EdaRbacRole';
import { EdaRolePermissions } from './EdaRolePermissions';
import { t } from 'i18next';

interface EdaRoleExpandedRowProps {
  role: EdaRbacRole;
}

export function EdaRoleExpandedRow(props: EdaRoleExpandedRowProps) {
  const { role } = props;

  const { data: roleDetails } = useGet<EdaRbacRole>(
    edaAPI`/role_definitions/${role.id?.toString() ?? ''}/`
  );

  if (!roleDetails) {
    return <ExpandableRowContent>{t('Loading...')}</ExpandableRowContent>;
  }

  return (
    <ExpandableRowContent>
      <EdaRolePermissions role={roleDetails} />
    </ExpandableRowContent>
  );
}
