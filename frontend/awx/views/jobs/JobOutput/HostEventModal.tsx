import { useTranslation } from 'react-i18next';
import { JobEvent } from '../../../interfaces/JobEvent';
import { useState } from 'react';
import { Modal, Tab, TabTitleText, Tabs } from '@patternfly/react-core';
import { PageDetail, PageDetails } from '../../../../../framework';
import { StatusCell } from '../../../../common/Status';

export function HostEventModal(props: {
  onClose: () => void;
  hostEvent: JobEvent;
  isOpen: boolean;
}) {
  const { onClose, hostEvent, isOpen = false } = props;
  const { t } = useTranslation();
  const [activeTabKey, setActiveTabKey] = useState<number>(0);

  const handleTabClick = (tabIndex: number) => {
    setActiveTabKey(tabIndex);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t`Host Details`}
      aria-label={t`Host details modal`}
      width="75%"
      ouiaId="host-event-modal"
    >
      <Tabs
        aria-label={t`Tabs`}
        activeKey={activeTabKey}
        onSelect={(_e, t) => handleTabClick(t as number)}
        ouiaId="host-event-tabs"
      >
        <Tab
          aria-label={t`Details tab`}
          ouiaId="details-tab"
          eventKey={0}
          title={<TabTitleText>{t`Details`}</TabTitleText>}
        >
          <PageDetails>
            <PageDetail isEmpty={!hostEvent.event_data?.host} label={t('Host')}>
              {hostEvent?.event_data?.host}
            </PageDetail>
            <PageDetail label={t('Status')}>
              <StatusCell status={processEventStatus(hostEvent)} />
            </PageDetail>
            <PageDetail isEmpty={!hostEvent.play} label={t('Play')}>
              {hostEvent?.play}
            </PageDetail>
            <PageDetail isEmpty={!hostEvent.task} label={t('Task')}>
              {hostEvent?.task}
            </PageDetail>
            <PageDetail isEmpty={!hostEvent.event_data?.task_action} label={t('Module')}>
              {hostEvent?.event_data?.task_action}
            </PageDetail>
          </PageDetails>
        </Tab>
      </Tabs>
    </Modal>
  );
}

function processEventStatus(event: JobEvent) {
  let status = '';
  if (event.event === 'runner_on_unreachable') {
    status = 'unreachable';
  }
  // equiv to 'runner_on_error' && 'runner_on_failed'
  if (event.failed) {
    status = 'failed';
  }
  if (
    event.event === 'runner_on_ok' ||
    event.event === 'runner_on_async_ok' ||
    event.event === 'runner_item_on_ok'
  ) {
    status = 'ok';
  }
  // if 'ok' and 'changed' are both true, show 'changed'
  if (event.changed) {
    status = 'changed';
  }
  if (event.event === 'runner_on_skipped') {
    status = 'skipped';
  }
  return status;
}
