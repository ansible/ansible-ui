import { QueryParams } from '@ansible/ansible-ui-framework';
import { usePageWizard } from '@ansible/ansible-ui-framework/PageWizard/PageWizardProvider';
import { SelectRolesStep } from '@ansible/common-ui/access/RolesWizard/steps/SelectRolesStep';
import { useMemo } from 'react';
import { usePlatformMultiSelectListView } from '../../../common/usePlatformMultiSelectListView';
import { PlatformRbacRole } from '../../../interfaces/PlatformRbacRole';
import { usePlatformRolesFilters } from '../../roles/hooks/usePlatformRolesFilters';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { usePlatformRoleColumns } from '../../roles/hooks/usePlatformRoleColumns';

export function PlatformSelectRolesStep(props: {
  contentType?: string;
  fieldNameForPreviousStep?: string;
  descriptionForRoleSelection?: string;
  title?: string;
}) {
  const toolbarFilters = usePlatformRolesFilters();
  const { wizardData } = usePageWizard();
  const { resourceType } = wizardData as { [key: string]: unknown };
  const { fieldNameForPreviousStep, title } = props;

  const contentType = useMemo(() => {
    return props.contentType
      ? props.contentType
      : ((resourceType as string)?.split('.').pop() ?? '');
  }, [props.contentType, resourceType]);

  const tableColumns = usePlatformRoleColumns({ disableLinks: true, disableExtraColumns: true });

  const queryParams = useMemo<QueryParams>(() => {
    const params: QueryParams = { content_type__api_slug: contentType };
    return params;
  }, [contentType]);

  const view = usePlatformMultiSelectListView<PlatformRbacRole>(
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
      title={title}
    />
  );
}
