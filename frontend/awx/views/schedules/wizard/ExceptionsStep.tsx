import { PageFormSection } from '@ansible/ansible-ui-framework/PageForm/Utils/PageFormSection';
import { usePageWizard } from '@ansible/ansible-ui-framework/PageWizard/PageWizardProvider';
import { Button } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { RuleForm } from '../components/RuleForm';
import { RulesList } from '../components/RulesList';
import { useUpdateRules } from '../hooks/useUpdateRules';
import { RuleListItemType, ScheduleFormWizard } from '../types';

export function ExceptionsStep() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState<boolean | number>(false);
  const { getValues, setValue } = useFormContext();
  const exceptions = getValues('exceptions') as RuleListItemType[];
  const hasExceptions = exceptions?.length > 0;
  const { wizardData } = usePageWizard();
  const updateRules = useUpdateRules();
  const { rules, timezone } = wizardData as ScheduleFormWizard;

  useEffect(() => {
    setValue('rules', rules);
    const updatedExceptions = updateRules(exceptions);
    setValue('exceptions', updatedExceptions);
  }, [updateRules, setValue, exceptions, rules]);

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
        <RulesList
          rules={exceptions}
          timezone={timezone}
          needsHeader
          ruleType="exception"
          setIsOpen={setIsOpen}
        />
      )}
    </PageFormSection>
  );
}
