import { Button } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { PageFormSection } from '../../../../../framework/PageForm/Utils/PageFormSection';
import { useState } from 'react';
import { RuleForm } from '../components/RuleForm';
import { RulesList } from '../components/RulesList';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { useWatch } from 'react-hook-form';
import { RuleListItemType } from '../types';

export function RulesStep() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState<boolean | number>(false);
  const rules = useWatch({ name: 'rules' }) as RuleListItemType[];
  const hasRules = rules?.length > 0;
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

      {hasRules && <RulesList rules={rules} ruleType="rules" setIsOpen={setIsOpen} />}
    </PageFormSection>
  );
}
