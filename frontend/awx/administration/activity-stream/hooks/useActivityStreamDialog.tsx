import { Button, Modal, ModalVariant } from '@patternfly/react-core';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityStream } from '../../../interfaces/ActivityStream';
import { ActivityStreamInitiatedByCell } from '../components/ActivityStreamInitiatedByCell';
import { ActivityDescription } from '../components/ActivityDescription';
import { PageDetail, PageDetails, usePageDialogs } from '../../../../../framework';
import { PageDetailCodeEditor } from '../../../../../framework/PageDetails/PageDetailCodeEditor';
import { formatDateString } from '../../../../../framework/utils/formatDateString';

export interface ActivityStreamModalProps {
  activity: ActivityStream;
  onClose?: () => void;
}

export function ActivityStreamDialog({ activity }: ActivityStreamModalProps) {
  const { t } = useTranslation();
  const { popDialog } = usePageDialogs();
  const onClose = () => popDialog();

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
  const { popDialog, pushDialog } = usePageDialogs();
  const [props, setProps] = useState<ActivityStreamModalProps>();
  useEffect(() => {
    if (props) {
      const onCloseHandler = () => {
        setProps(undefined);
        props.onClose?.();
      };
      pushDialog(<ActivityStreamDialog {...props} onClose={onCloseHandler} />);
    } else {
      popDialog();
    }
  }, [props, popDialog, pushDialog]);
  return setProps;
}
