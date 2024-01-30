import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageDialog } from '../../../../framework';
import { SelectSingleDialog } from '../../../../framework/PageDialogs/SelectSingleDialog';
import { gatewayAPI } from '../../../api/gateway-api-utils';
import { usePlatformView } from '../../../hooks/usePlatformView';
import { useTeamColumns } from '../hooks/useTeamColumns';
import { useTeamFilters } from '../hooks/useTeamFilters';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';

export function useSelectTeam() {
  const [_, setDialog] = usePageDialog();
  const { t } = useTranslation();
  const openSelectTeam = useCallback(
    (onSelect: (team: PlatformTeam) => void, defaultTeam: PlatformTeam) => {
      setDialog(
        <SelectTeam title={t('Select team')} onSelect={onSelect} defaultTeam={defaultTeam} />
      );
    },
    [setDialog, t]
  );
  return openSelectTeam;
}

function SelectTeam(props: {
  title: string;
  onSelect: (team: PlatformTeam) => void;
  defaultTeam?: PlatformTeam;
}) {
  const toolbarFilters = useTeamFilters();
  const tableColumns = useTeamColumns({ disableLinks: true });
  const view = usePlatformView<PlatformTeam>({
    url: gatewayAPI`/teams/`,
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
    defaultSelection: props.defaultTeam ? [props.defaultTeam] : undefined,
  });
  return (
    <SelectSingleDialog<PlatformTeam>
      {...props}
      toolbarFilters={toolbarFilters}
      tableColumns={tableColumns}
      view={view}
    />
  );
}
