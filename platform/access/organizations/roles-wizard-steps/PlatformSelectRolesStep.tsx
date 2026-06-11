import { QueryParams } from '@ansible/ansible-ui-framework';
import { SelectRolesStep } from '@ansible/common-ui/access/RolesWizard/steps/SelectRolesStep';
import { useMemo } from 'react';
import { usePlatformMultiSelectListView } from '../../../common/usePlatformMultiSelectListView';
import { PlatformRole } from '../../../interfaces/PlatformRole';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { usePlatformRolesFilters } from '../../roles/hooks/usePlatformRolesFilters';
import { usePlatformRoleColumns } from '../../roles/hooks/usePlatformRoleColumns';

export function PlatformSelectRolesStep(props: {
  roleType?: string;
  fieldNameForPreviousStep?: string;
  descriptionForRoleSelection?: string;
  title?: string;
}) {
  const toolbarFilters = usePlatformRolesFilters();
  const { roleType, fieldNameForPreviousStep, descriptionForRoleSelection, title } = props;

  const tableColumns = usePlatformRoleColumns({ disableLinks: true, disableExtraColumns: true });

  const queryParams = useMemo<QueryParams>(() => {
    const params: QueryParams = {};

    if (roleType) {
      params.content_type__api_slug = roleType;
    }

    return params;
  }, [roleType]);

  const view = usePlatformMultiSelectListView<PlatformRole>(
    {
      url: gatewayAPI`/role_definitions/`,
      toolbarFilters,
      tableColumns,
      queryParams,
      disableQueryString: true,
    },
    'platformRoles'
  );

  return (
    <SelectRolesStep
      view={view}
      tableColumns={tableColumns}
      toolbarFilters={toolbarFilters}
      fieldNameForPreviousStep={fieldNameForPreviousStep}
      descriptionForRoleSelection={descriptionForRoleSelection}
      title={title}
    />
  );
}
