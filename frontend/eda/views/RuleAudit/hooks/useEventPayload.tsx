import { CodeBlock, CodeBlockCode, Modal, ModalVariant } from '@patternfly/react-core';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { PageDetail, PageDetails, Scrollable, usePageDialog } from '../../../../../framework';
import { PageDetailsSection } from '../../../common/PageDetailSection';
import { formatDateString } from '../../../../../framework/utils/formatDateString';
import { EdaRuleAuditEvent } from '../../../interfaces/EdaRuleAuditEvent';

export function useEventPayload(event: EdaRuleAuditEvent) {
  const [_, setDialog] = usePageDialog();
  const showEventLog = useCallback(
    () => setDialog(<EventPayloadDialog id={event?.id} />),
    [setDialog]
  );
  return showEventLog;
}

export function EventPayloadDialog(event: EdaRuleAuditEvent) {
  const { t } = useTranslation();
  const [_, setDialog] = usePageDialog();
  const onClose = () => setDialog(undefined);

  return (
    <Modal
      title={t('Event details')}
      isOpen
      onClose={onClose}
      variant={ModalVariant.small}
      hasNoBodyWrapper
    >
      <Scrollable>
        <PageDetails>
          <PageDetail label={t('Name')}>{event?.source_name || ''}</PageDetail>
          <PageDetail label={t('Description')}>{event?.source_type || ''}</PageDetail>
          <PageDetail label={t('Timestamp')}>
            {event.received_at ? formatDateString(event?.received_at) : ''}
          </PageDetail>
        </PageDetails>
        {event?.payload && (
          <PageDetailsSection>
            (
            <PageDetail label={t('Event log')}>
              <CodeBlock>
                <CodeBlockCode
                  style={{
                    minHeight: '150px',
                  }}
                  id="code-content"
                >
                  {event?.payload}
                </CodeBlockCode>
              </CodeBlock>
            </PageDetail>
          </PageDetailsSection>
        )}
      </Scrollable>
    </Modal>
  );
}
