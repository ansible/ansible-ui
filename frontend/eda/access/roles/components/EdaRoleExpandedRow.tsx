import { useGet } from '@ansible/common-ui/crud/useGet';
import { ExpandableRowContent } from '@patternfly/react-table';
import { useTranslation } from 'react-i18next';
import { edaAPI } from '../../../common/eda-utils';
import { EdaRbacRole } from '../../../interfaces/EdaRbacRole';
import { EdaRolePermissions } from './EdaRolePermissions';

interface EdaRoleExpandedRowProps {
  role: EdaRbacRole;
}

export function EdaRoleExpandedRow(props: EdaRoleExpandedRowProps) {
  const { t } = useTranslation();
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
