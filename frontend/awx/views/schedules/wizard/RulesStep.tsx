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
          data-testid="add-rule-toolbar-button"
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
