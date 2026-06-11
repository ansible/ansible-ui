import { usePageDialog } from '@ansible/ansible-ui-framework';
import { SingleSelectDialog } from '@ansible/ansible-ui-framework/PageDialogs/SingleSelectDialog';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { usePlatformView } from '../../../hooks/usePlatformView';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { useOrganizationColumns } from '../hooks/useOrganizationColumns';
import { useOrganizationFilters } from '../hooks/useOrganizationFilters';

export function useSelectOrganization() {
  const [_, setDialog] = usePageDialog();
  const { t } = useTranslation();
  const openSelectOrganization = useCallback(
    (
      onSelect: (organization: PlatformOrganization) => void,
      defaultOrganization: PlatformOrganization
    ) => {
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

function SelectOrganization(props: {
  title: string;
  onSelect: (organization: PlatformOrganization) => void;
  defaultOrganization?: PlatformOrganization;
}) {
  const toolbarFilters = useOrganizationFilters();
  const tableColumns = useOrganizationColumns({ disableLinks: true });
  const view = usePlatformView<PlatformOrganization>({
    url: gatewayAPI`/organizations/`,
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
    defaultSelection: props.defaultOrganization ? [props.defaultOrganization] : undefined,
  });
  return (
    <SingleSelectDialog<PlatformOrganization>
      {...props}
      toolbarFilters={toolbarFilters}
      tableColumns={tableColumns}
      view={view}
    />
  );
}
