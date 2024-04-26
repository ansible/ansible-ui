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

export function RulesStep() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState<boolean | number>(false);
  const { setValue, getValues } = useFormContext();
  const { wizardData } = usePageWizard();

  const rules = getValues('rules') as RuleListItemType[];
  const hasRules = rules?.length > 0;
  useEffect(() => {
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
    const updatedRules = (rules || []).map(({ rule, id }) => {
      const newRule = new RRule({
        ...rule.options,
        tzid: timezone,
        dtstart: datetime(year, month, day, hour, minute),
      });
      return { rule: newRule, id };
    });
    setValue('rules', updatedRules);
  }, [rules, wizardData, setValue]);
  return (
    <PageFormSection title={t('Rules')} singleColumn>
      {!isOpen && hasRules && (
        <Button
          data-cy="add-rule-toolbar-button"
          icon={<PlusCircleIcon />}
          onClick={() => {
            setIsOpen(true);
          }}
          variant="link"
        >
          {t('Add rule')}
        </Button>
      )}
      {(isOpen || !hasRules) && (
        <RuleForm title={t('Define rules')} isOpen={isOpen} setIsOpen={setIsOpen} />
      )}

      {hasRules && <RulesList needsHeader rules={rules} ruleType="rules" setIsOpen={setIsOpen} />}
    </PageFormSection>
  );
}
