import { Button } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { PageFormSection } from '../../../../../framework/PageForm/Utils/PageFormSection';
import { useState } from 'react';
import { OccurrencesForm } from '../components/OccurrencesForm';
import { OccurrencesList } from '../components/OccurrencesList';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { FREQUENCIES_DEFAULT_VALUES } from './constants';

export function OccurrencesStep() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { control, setValue } = useFormContext();
  const {
    fields,
    append: addMap,
    remove: removeMap,
  } = useFieldArray({
    control,
    name: 'occurrences',
  });

  return (
    <PageFormSection title={t('Occurrences')} singleColumn>
      {!isOpen && (
        <Button
          icon={<PlusCircleIcon />}
          onClick={() => {
            setValue('occurrence', { ...FREQUENCIES_DEFAULT_VALUES, id: fields.length + 1 || 1 });
            setIsOpen(true);
          }}
          variant="link"
        >
          {t('Add occurrence')}
        </Button>
      )}
      {isOpen && (
        <OccurrencesForm
          removeMap={removeMap}
          addMap={addMap}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
        />
      )}
      <OccurrencesList />
    </PageFormSection>
  );
}
