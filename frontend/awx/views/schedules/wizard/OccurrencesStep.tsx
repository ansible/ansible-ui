import { Button } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { PageFormSection } from '../../../../../framework/PageForm/Utils/PageFormSection';
import { useState } from 'react';
import { OccurrencesForm } from '../components/OccurrencesForm';
import { ListItemType, OccurrencesList } from '../components/OccurrencesList';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { useFormContext } from 'react-hook-form';

export function OccurrencesStep() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { getValues } = useFormContext();
  const rules = getValues('rules') as ListItemType[];
  const hasRules = rules?.length > 0;
  return (
    <PageFormSection title={t('Occurrences')} singleColumn>
      {!isOpen && hasRules && (
        <Button
          icon={<PlusCircleIcon />}
          onClick={() => {
            setIsOpen(true);
          }}
          variant="link"
        >
          {t('Add occurrence')}
        </Button>
      )}
      {isOpen && (
        <OccurrencesForm title={t('Define occurrences')} isOpen={isOpen} setIsOpen={setIsOpen} />
      )}

      {(hasRules || (!isOpen && !hasRules)) && (
        <OccurrencesList listItems={rules} ruleType="exceptions" setIsOpen={setIsOpen} />
      )}
    </PageFormSection>
  );
}
