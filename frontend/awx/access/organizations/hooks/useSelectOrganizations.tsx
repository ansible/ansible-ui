import { useCallback } from 'react';
import { usePageDialog } from '../../../../../framework';
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
  const [_, setDialog] = usePageDialog();
  const openSelectOrganizations = useCallback(
    (title: string, onSelect: (organizations: Organization[]) => void) => {
      setDialog(<SelectOrganizations title={title} onSelect={onSelect} />);
    },
    [setDialog]
  );
  return openSelectOrganizations;
}
