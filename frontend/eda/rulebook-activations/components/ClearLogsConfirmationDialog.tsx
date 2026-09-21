import {
  Button,
  Checkbox,
  DatePicker,
  Flex,
  FlexItem,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  NumberInput,
  Radio,
  Stack,
  ValidatedOptions,
  isValidDate,
  yyyyMMddFormat,
} from '@patternfly/react-core';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface ClearLogsTarget {
  id: number;
  name: string;
}

export type ClearLogsTargetType = 'activation' | 'instance';

interface ClearLogsConfirmationDialogProps {
  targets: ReadonlyArray<ClearLogsTarget>;
  targetType?: ClearLogsTargetType;
  onClose: () => void;
  onConfirm: (beforeDate: string) => void;
}

type ClearLogsRange = 'older-than' | 'keep-last';

export function ClearLogsConfirmationDialog(props: Readonly<ClearLogsConfirmationDialogProps>) {
  const { t } = useTranslation();
  const targets = props.targets;
  const targetType = props.targetType ?? 'activation';
  const [range, setRange] = useState<ClearLogsRange>('keep-last');
  const [olderThanDate, setOlderThanDate] = useState('');
  const [isOlderThanDateValid, setIsOlderThanDateValid] = useState(false);
  const [keepLastDays, setKeepLastDays] = useState<number | ''>(7);
  const [isAcknowledged, setIsAcknowledged] = useState(false);
  const keepLastDaysErrorId = 'clear-logs-days-error';
  const isKeepLastDaysValid =
    range !== 'keep-last' ||
    (typeof keepLastDays === 'number' &&
      Number.isInteger(keepLastDays) &&
      keepLastDays >= 1 &&
      keepLastDays <= 36500);

  const canSubmit =
    isAcknowledged &&
    isKeepLastDaysValid &&
    (range === 'keep-last' || (olderThanDate.length > 0 && isOlderThanDateValid));

  const onConfirm = () => {
    if (!canSubmit) return;

    let beforeDate: string;
    if (range === 'older-than') {
      beforeDate = `${olderThanDate}T00:00:00.000Z`;
    } else {
      let days = 0;
      if (typeof keepLastDays === 'number') {
        days = keepLastDays;
      }
      beforeDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    }
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
        description={
          targetType === 'instance'
            ? t(
                'Removes stored logs for the selected instance ({{names}}). Activations continue running, and container logs are not affected. Logs outside this window remain unchanged. This cannot be undone.',
                { names: targets.map((target) => target.name).join(', ') }
              )
            : t(
                'Removes stored logs for {{names}}. Activations continue running, and container logs are not affected. Logs outside this window remain unchanged. This cannot be undone.',
                { names: targets.map((target) => target.name).join(', ') }
              )
        }
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
                    setIsOlderThanDateValid(
                      Boolean(date && isValidDate(date) && value === yyyyMMddFormat(date))
                    );
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
                  inputProps={{
                    'aria-describedby': keepLastDaysErrorId,
                    max: 36500,
                    min: 1,
                    step: 1,
                  }}
                  onChange={(event) => {
                    const value = event.currentTarget.value;
                    setKeepLastDays(value === '' ? '' : Number(value));
                  }}
                  onMinus={() =>
                    setKeepLastDays((days) =>
                      typeof days === 'number' ? Math.max(1, days - 1) : 1
                    )
                  }
                  onPlus={() =>
                    setKeepLastDays((days) =>
                      typeof days === 'number' ? Math.min(36500, days + 1) : 1
                    )
                  }
                  plusBtnAriaLabel={t('Increase days to keep')}
                  value={keepLastDays}
                  validated={
                    range === 'keep-last' && !isKeepLastDaysValid
                      ? ValidatedOptions.error
                      : undefined
                  }
                  widthChars={3}
                />
              </FlexItem>
              <FlexItem>{t('days')}</FlexItem>
            </Flex>
            {range === 'keep-last' && !isKeepLastDaysValid ? (
              <FormHelperText>
                <HelperText>
                  <HelperTextItem id={keepLastDaysErrorId} variant="error">
                    {t('Enter a whole number from 1 to 36500.')}
                  </HelperTextItem>
                </HelperText>
              </FormHelperText>
            ) : null}
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
