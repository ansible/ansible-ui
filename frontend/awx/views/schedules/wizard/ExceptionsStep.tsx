import { Button } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { PageFormSection } from '../../../../../framework/PageForm/Utils/PageFormSection';
import { useState } from 'react';
import { RuleForm } from '../components/RuleForm';
import { RulesList } from '../components/RulesList';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { useFormContext } from 'react-hook-form';
import { RuleListItemType } from '../types';

export function ExceptionsStep() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState<boolean | number>(false);
  const { getValues } = useFormContext();
  const exceptions = getValues('exceptions') as RuleListItemType[];
  const hasExceptions = exceptions?.length > 0;
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
        <RulesList rules={exceptions} ruleType="exception" setIsOpen={setIsOpen} />
      )}
    </PageFormSection>
  );
}
