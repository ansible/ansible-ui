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
  }, [setStepData, setValue, rules]);

  return (
    <PageFormSection title={t('Exceptions')} singleColumn>
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
