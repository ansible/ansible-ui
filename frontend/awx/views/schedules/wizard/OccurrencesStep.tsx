import { Button } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { PageFormSection } from '../../../../../framework/PageForm/Utils/PageFormSection';
import { useState } from 'react';
import { OccurrencesForm } from '../components/OccurrencesForm';
import { OccurrencesList } from '../components/OccurrencesList';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { useFormContext } from 'react-hook-form';
import { RRule } from 'rrule';

export function OccurrencesStep() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { getValues } = useFormContext();
  const rules = getValues('rules') as { id: number; rule: RRule }[];
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
      {isOpen && <OccurrencesForm isOpen={isOpen} setIsOpen={setIsOpen} />}

      {(hasRules || (!isOpen && !hasRules)) && <OccurrencesList setIsOpen={setIsOpen} />}
    </PageFormSection>
  );
}
