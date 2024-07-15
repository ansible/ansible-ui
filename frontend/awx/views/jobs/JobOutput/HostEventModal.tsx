import { Modal, Tab, TabTitleText, Tabs } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { PageDetail, PageDetails } from '../../../../../framework';
import { StatusCell } from '../../../../common/Status';

import { PageDetailCodeEditor } from '../../../../../framework/PageDetails/PageDetailCodeEditor';
import { EmptyStateNoData } from '../../../../../framework/components/EmptyStateNoData';
import { JobEvent } from '../../../interfaces/JobEvent';
import { useState } from 'react';

const processCodeEditorValue = (value: JobEvent) => {
  let codeEditorValue;

  if (!value.event_data?.res) {
    codeEditorValue = '';
  } else if (typeof value.event_data?.res === 'string') {
    codeEditorValue = value.event_data?.res;
  } else if (Array.isArray(value.event_data?.res)) {
    codeEditorValue = value.event_data?.res.join(' ');
  } else {
    codeEditorValue = value.event_data?.res;
  }
  return codeEditorValue;
};

const getStdOutValue = (hostEvent: JobEvent) => {
  const taskAction = hostEvent?.event_data?.task_action;
  const res = hostEvent?.event_data?.res;

  let stdOut = '';
  if (taskAction === 'debug' && res?.result?.stdout) {
    stdOut = res.result.stdout as string;
  } else if (taskAction === 'yum' && Array.isArray(res?.results)) {
    stdOut = res.results.join('\n');
  } else if (res?.stdout) {
    stdOut = Array.isArray(res.stdout) ? res.stdout.join(' ') : (res.stdout as string);
  }
  return stdOut;
};

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

  const jsonObj = processCodeEditorValue(hostEvent);
  const stdErr: string | undefined = hostEvent?.event_data?.res?.stderr;
  const stdOut: string = getStdOutValue(hostEvent);

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
        <Tab
          eventKey={1}
          title={<TabTitleText>{t`Data`}</TabTitleText>}
          aria-label={t`Data tab`}
          ouiaId="data-tab"
        >
          {activeTabKey === 1 && jsonObj ? (
            <PageDetailCodeEditor showCopyToClipboard value={JSON.stringify(jsonObj, null, 2)} />
          ) : (
            <EmptyStateNoData description={t('There is no data')} title={t`No Data Available`} />
          )}
        </Tab>
        {stdOut?.length ? (
          <Tab
            eventKey={2}
            title={<TabTitleText>{t`Output`}</TabTitleText>}
            aria-label={t`Output tab`}
            ouiaId="standard-out-tab"
          >
            <PageDetailCodeEditor value={stdOut} />
          </Tab>
        ) : null}
        {stdErr?.length ? (
          <Tab
            eventKey={3}
            title={<TabTitleText>{t`Standard Error`}</TabTitleText>}
            aria-label={t`Standard error tab`}
            ouiaId="standard-error-tab"
          >
            <PageDetailCodeEditor value={stdErr} />
          </Tab>
        ) : null}
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
