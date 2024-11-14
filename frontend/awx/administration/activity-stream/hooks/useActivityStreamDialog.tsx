import { PageDetail, PageDetails, usePageDialog } from '@ansible/ansible-ui-framework';
import { PageDetailCodeEditor } from '@ansible/ansible-ui-framework/PageDetails/PageDetailCodeEditor';
import { formatDateString } from '@ansible/ansible-ui-framework/utils/formatDateString';
import { Button, Modal, ModalVariant } from '@patternfly/react-core';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityStream } from '../../../interfaces/ActivityStream';
import { ActivityDescription } from '../components/ActivityDescription';
import { ActivityStreamInitiatedByCell } from '../components/ActivityStreamInitiatedByCell';

export interface ActivityStreamModalProps {
  activity: ActivityStream;
  onClose?: () => void;
}

export function ActivityStreamDialog({ activity }: ActivityStreamModalProps) {
  const { t } = useTranslation();
  const [_, setDialog] = usePageDialog();
  const onClose = () => setDialog(undefined);

  return (
    <Modal
      title={t('Event details')}
      data-cy="activity-stream-event-modal"
      aria-label={t('Event details')}
      isOpen
      hasNoBodyWrapper
      onClose={onClose}
      variant={ModalVariant.medium}
      actions={[
        <Button key="cancel" variant="primary" onClick={onClose}>
          {t('Close')}
        </Button>,
      ]}
    >
      <PageDetails>
        <PageDetail label={t('Time')}>{formatDateString(activity.timestamp)}</PageDetail>
        <PageDetail label={t('Initiated by')}>
          <ActivityStreamInitiatedByCell item={activity} />
        </PageDetail>
        {activity.object1 === 'setting' && activity.summary_fields?.setting && (
          <PageDetail label={t('Setting category')}>
            {activity.summary_fields.setting[0].category}
          </PageDetail>
        )}
        {activity.object1 === 'setting' && activity.summary_fields?.setting && (
          <PageDetail label={t('Setting name')}>
            {activity.summary_fields.setting[0].name}
          </PageDetail>
        )}
        <PageDetail label={t('Action')}>
          <ActivityDescription activity={activity} />
        </PageDetail>
      </PageDetails>
      {activity.changes && (
        <PageDetails numberOfColumns="single">
          <PageDetailCodeEditor
            label={t('Changes')}
            value={JSON.stringify(activity.changes)}
            showCopyToClipboard={true}
          />
        </PageDetails>
      )}
    </Modal>
  );
}

export function useActivityStreamDialog() {
  const [_, setDialog] = usePageDialog();
  const [props, setProps] = useState<ActivityStreamModalProps>();
  useEffect(() => {
    if (props) {
      const onCloseHandler = () => {
        setProps(undefined);
        props.onClose?.();
      };
      setDialog(<ActivityStreamDialog {...props} onClose={onCloseHandler} />);
    } else {
      setDialog(undefined);
    }
  }, [props, setDialog]);
  return setProps;
}
