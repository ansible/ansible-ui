import {
  Button,
  Checkbox,
  DatePicker,
  Flex,
  FlexItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  NumberInput,
  Radio,
  Stack,
} from '@patternfly/react-core';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface ClearLogsActivation {
  id: number;
  name: string;
}

interface ClearLogsConfirmationDialogProps {
  activations: ReadonlyArray<ClearLogsActivation>;
  onClose: () => void;
  onConfirm: (beforeDate: string) => void;
}

type ClearLogsRange = 'older-than' | 'keep-last';

export function ClearLogsConfirmationDialog(props: Readonly<ClearLogsConfirmationDialogProps>) {
  const { t } = useTranslation();
  const activations = props.activations;
  const [range, setRange] = useState<ClearLogsRange>('keep-last');
  const [olderThanDate, setOlderThanDate] = useState('');
  const [isOlderThanDateValid, setIsOlderThanDateValid] = useState(false);
  const [keepLastDays, setKeepLastDays] = useState(7);
  const [isAcknowledged, setIsAcknowledged] = useState(false);

  const canSubmit =
    isAcknowledged && (range === 'keep-last' || (olderThanDate.length > 0 && isOlderThanDateValid));

  const onConfirm = () => {
    if (!canSubmit) return;

    const beforeDate =
      range === 'older-than'
        ? `${olderThanDate}T00:00:00.000Z`
        : new Date(Date.now() - keepLastDays * 24 * 60 * 60 * 1000).toISOString();
    props.onConfirm(beforeDate);
  };

  return (
    <Modal
      aria-label={t('Clear logs?')}
      elementToFocus="#clear-logs-cancel"
      isOpen
      onClose={props.onClose}
      variant={ModalVariant.medium}
    >
      <ModalHeader
        title={t('Clear logs?')}
        titleIconVariant="warning"
        description={t(
          'Removes stored logs for {{names}}. Activations continue running, and container logs are not affected. Logs outside this window remain unchanged. This cannot be undone.',
          { names: activations.map((activation) => activation.name).join(', ') }
        )}
      />
      <ModalBody>
        <Stack hasGutter>
          <Stack hasGutter>
            <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapMd' }}>
              <FlexItem>
                <Radio
                  id="clear-logs-older-than"
                  name="clear-logs-range"
                  isChecked={range === 'older-than'}
                  onChange={() => setRange('older-than')}
                  label={t('Older than')}
                />
              </FlexItem>
              <FlexItem flex={{ default: 'flex_1' }}>
                <DatePicker
                  aria-label={t('Clear logs older than')}
                  appendTo={() => document.body}
                  isDisabled={range !== 'older-than'}
                  invalidFormatText={t('Enter a valid date in YYYY-MM-DD format')}
                  onChange={(_, value, date) => {
                    setOlderThanDate(value);
                    setIsOlderThanDateValid(Boolean(date));
                  }}
                  placeholder={t('YYYY-MM-DD')}
                  value={olderThanDate}
                />
              </FlexItem>
            </Flex>
            <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapMd' }}>
              <FlexItem>
                <Radio
                  id="clear-logs-keep-last"
                  name="clear-logs-range"
                  isChecked={range === 'keep-last'}
                  onChange={() => setRange('keep-last')}
                  label={t('Keep last')}
                />
              </FlexItem>
              <FlexItem>
                <NumberInput
                  aria-label={t('Days to keep')}
                  inputAriaLabel={t('Days to keep')}
                  isDisabled={range !== 'keep-last'}
                  max={36500}
                  min={1}
                  minusBtnAriaLabel={t('Decrease days to keep')}
                  onChange={(event) => {
                    const value = Number(event.currentTarget.value);
                    setKeepLastDays(Number.isFinite(value) && value > 0 ? value : 1);
                  }}
                  onMinus={() => setKeepLastDays((days) => Math.max(1, days - 1))}
                  onPlus={() => setKeepLastDays((days) => Math.min(36500, days + 1))}
                  plusBtnAriaLabel={t('Increase days to keep')}
                  value={keepLastDays}
                  widthChars={3}
                />
              </FlexItem>
              <FlexItem>{t('days')}</FlexItem>
            </Flex>
          </Stack>
          <Checkbox
            id="clear-logs-acknowledgement"
            isChecked={isAcknowledged}
            onChange={(_, checked) => setIsAcknowledged(checked)}
            label={t('I understand that clearing logs cannot be undone.')}
          />
        </Stack>
      </ModalBody>
      <ModalFooter>
        <Button variant="danger" isDisabled={!canSubmit} onClick={onConfirm}>
          {t('Clear logs')}
        </Button>
        <Button id="clear-logs-cancel" variant="link" onClick={props.onClose}>
          {t('Cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
