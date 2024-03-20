import { Button } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { PageFormSection } from '../../../../../framework/PageForm/Utils/PageFormSection';
import { useState } from 'react';
import { OccurrencesForm } from '../components/OccurrencesForm';
import { ListItemType, OccurrencesList } from '../components/OccurrencesList';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { useFormContext } from 'react-hook-form';

export function ExceptionsStep() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { getValues } = useFormContext();
  const exceptions = getValues('exceptions') as ListItemType[];
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
      {isOpen && (
        <OccurrencesForm isOpen={isOpen} title={t('Define exceptions')} setIsOpen={setIsOpen} />
      )}

      {(hasExceptions || (!isOpen && !hasExceptions)) && (
        <OccurrencesList listItems={exceptions} ruleType="exception" setIsOpen={setIsOpen} />
      )}
    </PageFormSection>
  );
}
