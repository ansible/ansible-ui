import { PageDetail, PageDetails, Scrollable, usePageDialog } from '@ansible/ansible-ui-framework';
import { PageDetailCodeEditor } from '@ansible/ansible-ui-framework/PageDetails/PageDetailCodeEditor';
import { formatDateString } from '@ansible/ansible-ui-framework/utils/formatDateString';
import {
  Button,
  Modal,
  ModalVariant,
  ModalHeader,
  ModalFooter,
  ModalBody,
} from '@patternfly/react-core';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EdaRuleAuditEvent } from '../interfaces/EdaRuleAuditEvent';

export interface EventPayloadModalProps {
  event?: EdaRuleAuditEvent;
  onClose?: () => void;
}

export function EventPayloadDialog(props: EventPayloadModalProps) {
  const { t } = useTranslation();
  const [_, setDialog] = usePageDialog();
  const onClose = () => setDialog(undefined);

  return (
    <Modal aria-label={t('Event details')} isOpen onClose={onClose} variant={ModalVariant.medium}>
      <ModalHeader title={t('Event details')} />
      <ModalBody>
        <Scrollable>
          <PageDetails disableScroll={true}>
            <PageDetail label={t('Name')}>{props?.event?.source_name || ''}</PageDetail>
            <PageDetail label={t('Source type')}>{props?.event?.source_type || ''}</PageDetail>
            <PageDetail label={t('Timestamp')}>
              {props?.event?.received_at ? formatDateString(props.event?.received_at) : ''}
            </PageDetail>
          </PageDetails>

          {props?.event?.payload && (
            <PageDetails disableScroll={true} numberOfColumns="single">
              <PageDetailCodeEditor
                label={t('Event log')}
                value={props?.event?.payload}
                showCopyToClipboard={true}
              />
            </PageDetails>
          )}
        </Scrollable>
      </ModalBody>
      <ModalFooter>
        <Button key="cancel" variant="primary" onClick={onClose}>
          {t('Close')}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export function useEventPayloadDialog() {
  const [_, setDialog] = usePageDialog();
  const [props, setProps] = useState<EventPayloadModalProps>();
  useEffect(() => {
    if (props) {
      const onCloseHandler = () => {
        setProps(undefined);
        props.onClose?.();
      };
      setDialog(<EventPayloadDialog {...props} onClose={onCloseHandler} />);
    } else {
      setDialog(undefined);
    }
  }, [props, setDialog]);
  return setProps;
}
