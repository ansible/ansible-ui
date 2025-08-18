import { SelectRolesStep } from '@ansible/common-ui/access/RolesWizard/steps/SelectRolesStep';
import { useTranslation } from 'react-i18next';
import { usePlatformMultiSelectListView } from '../../../common/usePlatformMultiSelectListView';
import { PlatformRole } from '../../../interfaces/PlatformRole';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { usePlatformRoleColumns } from '../../roles/hooks/usePlatformRoleColumns';
import { usePlatformRolesFilters } from '../../roles/hooks/usePlatformRolesFilters';

export function PlatformSelectOrganizationRolesStep(props: { fieldNameForPreviousStep?: string }) {
  const toolbarFilters = usePlatformRolesFilters();

  const { t } = useTranslation();
  const { fieldNameForPreviousStep } = props;

  const tableColumns = usePlatformRoleColumns({ disableLinks: true, disableExtraColumns: true });

  const view = usePlatformMultiSelectListView<PlatformRole>(
    {
      url: gatewayAPI`/role_definitions/`,
      queryParams: {
        content_type__api_slug: 'shared.organization',
      },
      toolbarFilters,
      tableColumns,
      disableQueryString: true,
    },
    'awxRoles'
  );

  return (
    <SelectRolesStep
      view={view}
      tableColumns={tableColumns}
      toolbarFilters={toolbarFilters}
      fieldNameForPreviousStep={fieldNameForPreviousStep}
      descriptionForRoleSelection={t(
        'Select the organization roles that you want to apply to the selected teams. These roles will apply to relevant resources within this organization. Users in these teams will inherit these roles.'
      )}
      title={t('Select organization roles')}
    />
  );
}
