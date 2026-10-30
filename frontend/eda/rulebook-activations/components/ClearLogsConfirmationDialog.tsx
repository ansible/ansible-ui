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
import { Trans, useTranslation } from 'react-i18next';

export interface ClearLogsTarget {
  id: number;
  name: string;
}

export type ClearLogsTargetType = 'activation' | 'instance';

interface ClearLogsConfirmationDialogProps {
  targets: ReadonlyArray<ClearLogsTarget>;
  targetType?: ClearLogsTargetType;
  onClose: () => void;
  onConfirm: (beforeDate?: string) => void;
}

type ClearLogsRange = 'all' | 'older-than' | 'keep-last';

interface ClearLogsDescriptionProps {
  targets: ReadonlyArray<ClearLogsTarget>;
  targetType: ClearLogsTargetType;
}

function ClearLogsDescription(props: Readonly<ClearLogsDescriptionProps>) {
  const { t } = useTranslation();
  const targetNames = (
    props.targetType === 'activation' ? props.targets.slice(0, 5) : props.targets
  )
    .map((target) => target.name)
    .join(', ');

  if (props.targetType === 'instance') {
    return (
      <Trans>
        This deletes stored database logs for the selected instance (<strong>{targetNames}</strong>
        {/* */}
        ). Rulebook activations will continue running, and system logs on activation workers remain
        unaffected.
      </Trans>
    );
  }

  if (props.targets.length > 5) {
    return t(
      'This deletes stored database logs for {{count}} activations. Rulebook activations will continue running, and system logs on activation workers remain unaffected.',
      { count: props.targets.length }
    );
  }

  return (
    <Trans>
      This deletes stored database logs for <strong>{targetNames}</strong>. Rulebook activations
      will continue running, and system logs on activation workers remain unaffected.
    </Trans>
  );
}

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
    (range === 'all' ||
      (range === 'keep-last' && isKeepLastDaysValid) ||
      (range === 'older-than' && olderThanDate.length > 0 && isOlderThanDateValid));
  const onConfirm = () => {
    if (!canSubmit) return;

    let beforeDate: string | undefined;
    if (range === 'older-than') {
      beforeDate = `${olderThanDate}T00:00:00.000Z`;
    } else if (range === 'keep-last') {
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
      aria-label={t('Permanently Delete Logs')}
      elementToFocus="#clear-logs-cancel"
      isOpen
      onClose={props.onClose}
      variant={ModalVariant.medium}
    >
      <ModalHeader
        title={t('Permanently Delete Logs')}
        titleIconVariant="warning"
        description={<ClearLogsDescription targets={targets} targetType={targetType} />}
      />
      <ModalBody>
        <Stack hasGutter>
          <Stack hasGutter>
            <Radio
              id="clear-logs-all"
              name="clear-logs-range"
              isChecked={range === 'all'}
              onChange={() => setRange('all')}
              label={t('Delete all logs')}
            />
            <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapMd' }}>
              <FlexItem>
                <Radio
                  id="clear-logs-older-than"
                  name="clear-logs-range"
                  isChecked={range === 'older-than'}
                  onChange={() => setRange('older-than')}
                  label={t('Delete logs older than')}
                />
              </FlexItem>
              <FlexItem flex={{ default: 'flex_1' }}>
                <DatePicker
                  aria-label={t('Delete logs older than')}
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
                  label={t('Delete logs older than {{days}} days', {
                    days: keepLastDays === '' ? '?' : keepLastDays,
                  })}
                />
              </FlexItem>
              <FlexItem>
                <NumberInput
                  aria-label={t('Number of days')}
                  inputAriaLabel={t('Number of days')}
                  isDisabled={range !== 'keep-last'}
                  max={36500}
                  min={1}
                  minusBtnAriaLabel={t('Decrease number of days')}
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
                  plusBtnAriaLabel={t('Increase number of days')}
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
            label={t(
              'Yes, I confirm that I want to permanently delete these logs and understand that this action cannot be undone.'
            )}
          />
        </Stack>
      </ModalBody>
      <ModalFooter>
        <Button variant="danger" isDisabled={!canSubmit} onClick={onConfirm}>
          {t('Delete logs')}
        </Button>
        <Button id="clear-logs-cancel" variant="link" onClick={props.onClose}>
          {t('Cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
