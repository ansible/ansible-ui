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
import { useUpdateRules } from '../hooks/useUpdateRules';

export function RulesStep() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState<boolean | number>(false);
  const { setValue, getValues } = useFormContext();
  const { wizardData } = usePageWizard<ScheduleFormWizard>();

  const updateRules = useUpdateRules();
  const { timezone } = wizardData;
  const rules = getValues('rules') as RuleListItemType[];
  const hasRules = rules?.length > 0;
  useEffect(() => {
    const updatedRules = updateRules(rules);
    setValue('rules', updatedRules);
  }, [rules, setValue, updateRules]);
  return (
    <PageFormSection singleColumn>
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

      {hasRules && (
        <RulesList
          needsHeader
          timezone={timezone}
          rules={rules}
          ruleType="rules"
          setIsOpen={setIsOpen}
        />
      )}
    </PageFormSection>
  );
}
