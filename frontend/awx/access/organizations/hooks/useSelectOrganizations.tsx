import { useCallback } from 'react';
import { usePageDialog } from '../../../../../framework';
import { MultiSelectDialog } from '../../../../../framework/PageDialogs/MultiSelectDialog';
import { Organization } from '../../../interfaces/Organization';
import { useAwxView } from '../../../useAwxView';
import { useOrganizationsColumns, useOrganizationsFilters } from '../Organizations';
import { awxAPI } from '../../../api/awx-utils';

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
  const [_, setDialog] = usePageDialog();
  const openSelectOrganizations = useCallback(
    (title: string, onSelect: (organizations: Organization[]) => void) => {
      setDialog(<SelectOrganizations title={title} onSelect={onSelect} />);
    },
    [setDialog]
  );
  return openSelectOrganizations;
}
