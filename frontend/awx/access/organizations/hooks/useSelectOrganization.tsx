import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageDialog, useSelectDialog } from '../../../../../framework';
import { SingleSelectDialog } from '../../../../../framework/PageDialogs/SingleSelectDialog';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxView } from '../../../common/useAwxView';
import { Organization } from '../../../interfaces/Organization';
import { useOrganizationsColumns, useOrganizationsFilters } from '../Organizations';

export function useSelectOrganization() {
  const { t } = useTranslation();
  const toolbarFilters = useOrganizationsFilters();
  const tableColumns = useOrganizationsColumns({ disableLinks: true });
  const view = useAwxView<Organization>({
    url: awxAPI`/organizations/`,
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
  });
  return useSelectDialog<Organization>({
    toolbarFilters,
    tableColumns,
    view,
    confirm: t('Confirm'),
    cancel: t('Cancel'),
    selected: t('Selected'),
  });
}

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
    <SingleSelectDialog<Organization>
      {...props}
      toolbarFilters={toolbarFilters}
      tableColumns={tableColumns}
      view={view}
    />
  );
}

export function useSelectOrganization2() {
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
