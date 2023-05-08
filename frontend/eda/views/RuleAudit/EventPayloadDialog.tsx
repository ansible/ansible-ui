import { CodeBlock, CodeBlockCode, Modal, ModalVariant } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { PageDetail, PageDetails, Scrollable, usePageDialog } from '../../../../framework';
import { PageDetailsSection } from '../../common/PageDetailSection';
import { formatDateString } from '../../../../framework/utils/formatDateString';
import { EdaRuleAuditEvent } from '../../interfaces/EdaRuleAuditEvent';
import { useEffect, useState } from 'react';

export interface EventPayloadModalProps {
  event?: EdaRuleAuditEvent;
  onClose?: () => void;
}

export function EventPayloadDialog(props: EventPayloadModalProps) {
  const { t } = useTranslation();
  const [_, setDialog] = usePageDialog();
  const onClose = () => setDialog(undefined);

  return (
    <Modal
      title={t('Event details')}
      isOpen
      hasNoBodyWrapper
      onClose={onClose}
      variant={ModalVariant.medium}
    >
      <Scrollable>
        <PageDetails>
          <PageDetail label={t('Name')}>{props?.event?.source_name || ''}</PageDetail>
          <PageDetail label={t('Source type')}>{props?.event?.source_type || ''}</PageDetail>
          <PageDetail label={t('Timestamp')}>
            {props?.event?.received_at ? formatDateString(props.event?.received_at) : ''}
          </PageDetail>
        </PageDetails>
        {props?.event?.payload && (
          <PageDetailsSection>
            <PageDetail label={t('Event log')}>
              <CodeBlock>
                <CodeBlockCode
                  style={{
                    minHeight: '150px',
                  }}
                  id="code-content"
                >
                  {JSON.stringify(props?.event?.payload || '')}
                </CodeBlockCode>
              </CodeBlock>
            </PageDetail>
          </PageDetailsSection>
        )}
      </Scrollable>
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
