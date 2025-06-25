import { IFilterState, LoadingPage, PageDetail, PageDetails } from '@ansible/ansible-ui-framework';
import { formatDateString } from '@ansible/ansible-ui-framework/utils/formatDateString';
import { useGetItem } from '@ansible/common-ui/crud/useGet';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { edaAPI } from '../../common/eda-utils';
import { EdaActivationInstance } from '../../interfaces/EdaActivationInstance';
import { StatusCell } from '../../../common/Status';
import { ActivationInstanceEvents } from './ActivationInstanceEvents';
import { useMemo, useState } from 'react';
import { useActivationHistoryLogsFilters } from '../hooks/useActivationHistoryLogsFilters';
import { RulebookActivationToolbar } from './ActivationsToolbar';
import { StatusEnum } from '../../interfaces/generated/eda-api';

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

function ActivationInstanceDetailsInner(props: { activationInstance: EdaActivationInstance }) {
  const { t } = useTranslation();
  const toolbarFilters = useActivationHistoryLogsFilters();
  const [filterState, setFilterState] = useState<IFilterState>({});
  const activationInstance = props.activationInstance;
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
      ></RulebookActivationToolbar>
      <ActivationInstanceEvents
        toolbarFilters={toolbarFilters}
        filterState={filterState}
        isFollowModeEnabled={isFollowModeEnabled}
        setIsFollowModeEnabled={setIsFollowModeEnabled}
        isRunning={isRunning}
      />
    </>
  );
}
