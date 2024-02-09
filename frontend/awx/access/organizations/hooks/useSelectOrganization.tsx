import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageDialog } from '../../../../../framework';
import { SelectSingleDialog } from '../../../../../framework/PageDialogs/SelectSingleDialog';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxView } from '../../../common/useAwxView';
import { Organization } from '../../../interfaces/Organization';
import { useOrganizationsColumns, useOrganizationsFilters } from '../Organizations';

function SelectOrganization(props: {
  title: string;
  onSelect: (organization: Organization) => void;
  defaultOrganization?: Organization;
}) {
  const toolbarFilters = useOrganizationsFilters();
  const tableColumns = useOrganizationsColumns({ disableLinks: true });
  const view = useAwxView<Organization>({
    url: awxAPI`/organizations/`,
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
    defaultSelection: props.defaultOrganization ? [props.defaultOrganization] : undefined,
  });
  return (
    <SelectSingleDialog<Organization>
      {...props}
      toolbarFilters={toolbarFilters}
      tableColumns={tableColumns}
      view={view}
    />
  );
}

export function useSelectOrganization() {
  const [_, setDialog] = usePageDialog();
  const { t } = useTranslation();
  const openSelectOrganization = useCallback(
    (onSelect: (organization: Organization) => void, defaultOrganization: Organization) => {
      setDialog(
        <SelectOrganization
          title={t('Select organization')}
          onSelect={onSelect}
          defaultOrganization={defaultOrganization}
        />
      );
    },
    [setDialog, t]
  );
  return openSelectOrganization;
}
