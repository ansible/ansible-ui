import { useCallback } from 'react';
import { usePageDialogs } from '../../../../../framework';
import { MultiSelectDialog } from '../../../../../framework/PageDialogs/MultiSelectDialog';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxView } from '../../../common/useAwxView';
import { Organization } from '../../../interfaces/Organization';
import { useOrganizationsColumns, useOrganizationsFilters } from '../Organizations';

function SelectOrganizations(props: {
  title: string;
  onSelect: (organizations: Organization[]) => void;
}) {
  const toolbarFilters = useOrganizationsFilters();
  const tableColumns = useOrganizationsColumns({ disableLinks: true });
  const view = useAwxView<Organization>({
    url: awxAPI`/organizations/`,
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
  });
  return (
    <MultiSelectDialog
      {...props}
      toolbarFilters={toolbarFilters}
      tableColumns={tableColumns}
      view={view}
    />
  );
}

export function useSelectOrganizations() {
  const { pushDialog } = usePageDialogs();
  const openSelectOrganizations = useCallback(
    (title: string, onSelect: (organizations: Organization[]) => void) => {
      pushDialog(<SelectOrganizations title={title} onSelect={onSelect} />);
    },
    [pushDialog]
  );
  return openSelectOrganizations;
}
