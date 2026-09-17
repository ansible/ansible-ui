import { IFilterState, LoadingPage, PageDetail, PageDetails } from '@ansible/ansible-ui-framework';
import { formatDateString } from '@ansible/ansible-ui-framework/utils/formatDateString';
import { useGetItem } from '@ansible/common-ui/crud/useGet';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { StatusCell } from '../../../common/Status';
import { edaAPI } from '../../common/eda-utils';
import { useEdaActiveUser } from '../../common/useEdaActiveUser';
import { EdaActivationInstance } from '../../interfaces/EdaActivationInstance';
import { StatusEnum } from '../../interfaces/generated/eda-api';
import { useActivationHistoryLogsFilters } from '../hooks/useActivationHistoryLogsFilters';
import { useClearLogsDialog } from '../hooks/useClearLogsDialog';
import { ActivationInstanceEvents } from './ActivationInstanceEvents';
import { RulebookActivationToolbar } from './ActivationsToolbar';

export function ActivationInstanceDetails() {
  const params = useParams<{ instanceId: string }>();
  const { data: activationInstance } = useGetItem<EdaActivationInstance>(
    edaAPI`/activation-instances/`,
    params.instanceId
  );

  if (!activationInstance) {
    return <LoadingPage />;
  }
  return <ActivationInstanceDetailsInner activationInstance={activationInstance} />;
}

function ActivationInstanceDetailsInner(
  props: Readonly<{ activationInstance: EdaActivationInstance }>
) {
  const { t } = useTranslation();
  const { activeEdaUser } = useEdaActiveUser();
  const toolbarFilters = useActivationHistoryLogsFilters();
  const [filterState, setFilterState] = useState<IFilterState>({});
  const [logsRefreshToken, setLogsRefreshToken] = useState(0);
  const activationInstance = props.activationInstance;
  const openClearLogsDialog = useClearLogsDialog({
    endpointBuilder: (target) => edaAPI`/activation-instances/${target.id.toString()}/clear-logs/`,
    targetType: 'instance',
    onComplete: (successfulTargets) => {
      if (successfulTargets.some((target) => target.id === activationInstance.id)) {
        setLogsRefreshToken((token) => token + 1);
      }
    },
  });
  const onClearLogs = useCallback(() => {
    openClearLogsDialog([
      {
        id: activationInstance.id,
        name: `${activationInstance.id} - ${activationInstance.name}`,
      },
    ]);
  }, [activationInstance.id, activationInstance.name, openClearLogsDialog]);
  const isRunning = useMemo(
    () =>
      activationInstance?.status
        ? [StatusEnum.Running, StatusEnum.Pending, StatusEnum.Starting].includes(
            activationInstance.status
          )
        : false,
    [activationInstance?.status]
  );
  const [isFollowModeEnabled, setIsFollowModeEnabled] = useState(isRunning);

  return (
    <>
      <PageDetails disableScroll={true}>
        <PageDetail label={t('Name')}>
          {`${props.activationInstance?.id || ''} - ${props.activationInstance?.name ?? ''}`}
        </PageDetail>
        <PageDetail label={t('Status')}>
          {<StatusCell status={props.activationInstance?.status ?? 'unknown'} />}
        </PageDetail>
        <PageDetail label={t('Start date')}>
          {props.activationInstance?.started_at
            ? formatDateString(props.activationInstance?.started_at)
            : ''}
        </PageDetail>
        <PageDetail label={t('End date')}>
          {props.activationInstance?.ended_at
            ? formatDateString(props.activationInstance?.ended_at)
            : ''}
        </PageDetail>
      </PageDetails>
      <RulebookActivationToolbar
        toolbarFilters={toolbarFilters}
        filterState={filterState}
        setFilterState={setFilterState}
        isFollowModeEnabled={isFollowModeEnabled}
        setIsFollowModeEnabled={setIsFollowModeEnabled}
        isRunning={isRunning}
        isClearLogsDisabled={activeEdaUser?.is_superuser !== true}
        onClearLogs={onClearLogs}
      />
      <ActivationInstanceEvents
        toolbarFilters={toolbarFilters}
        filterState={filterState}
        isFollowModeEnabled={isFollowModeEnabled}
        setIsFollowModeEnabled={setIsFollowModeEnabled}
        isRunning={isRunning}
        refreshToken={logsRefreshToken}
      />
    </>
  );
}
