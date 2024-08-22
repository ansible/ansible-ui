import { Button } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { PageFormSection } from '../../../../../framework/PageForm/Utils/PageFormSection';
import { useEffect, useState } from 'react';
import { RuleForm } from '../components/RuleForm';
import { RulesList } from '../components/RulesList';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { useFormContext } from 'react-hook-form';
import { RuleListItemType, ScheduleFormWizard } from '../types';
import { usePageWizard } from '../../../../../framework/PageWizard/PageWizardProvider';
import { DateTime } from 'luxon';
import { RRule, datetime } from 'rrule';

export function ExceptionsStep() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState<boolean | number>(false);
  const { getValues, setValue } = useFormContext();
  const exceptions = getValues('exceptions') as RuleListItemType[];
  const hasExceptions = exceptions?.length > 0;
  const { setStepData, wizardData } = usePageWizard();
  const { rules } = wizardData as ScheduleFormWizard;

  useEffect(() => {
    setValue('rules', rules);
    const {
      timezone,
      startDateTime: { date, time },
    } = wizardData as ScheduleFormWizard;

    const [startHour, startMinute] = time.split(':');
    const isStartPM = time.includes('PM');
    const start = DateTime.fromISO(`${date}`)
      .set({
        hour: isStartPM ? parseInt(startHour, 10) + 12 : parseInt(`${startHour}`, 10),
        minute: parseInt(startMinute, 10),
      })
      .toUTC();
    const { year, month, day, hour, minute } = start;
    const updatedExceptions = (exceptions || []).map(({ rule, id }) => {
      const newRule = new RRule({
        ...rule.options,
        tzid: timezone,
        dtstart: datetime(year, month, day, hour, minute),
      });
      return { rule: newRule, id };
    });

    setValue('exceptions', updatedExceptions);
  }, [setStepData, setValue, exceptions, rules, wizardData]);

  return (
    <PageFormSection singleColumn>
      {!isOpen && hasExceptions && (
        <Button
          icon={<PlusCircleIcon />}
          onClick={() => {
            setIsOpen(true);
          }}
          variant="link"
        >
          {t('Add exception')}
        </Button>
      )}
      {isOpen && <RuleForm isOpen={isOpen} title={t('Define exceptions')} setIsOpen={setIsOpen} />}

      {(hasExceptions || (!isOpen && !hasExceptions)) && (
        <RulesList rules={exceptions} needsHeader ruleType="exception" setIsOpen={setIsOpen} />
      )}
    </PageFormSection>
  );
}
