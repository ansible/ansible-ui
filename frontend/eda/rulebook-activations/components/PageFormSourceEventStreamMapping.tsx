import { Button, Modal, ModalBoxBody, ModalVariant } from '@patternfly/react-core';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageDialog } from '../../../../framework';
import { SourceEventMapFields } from './SourceEventMapFields';
import { EdaRulebook } from '../../interfaces/EdaRulebook';
import { EdaSourceEventMapping } from '../../interfaces/EdaSource';
import { EdaPageForm } from '../../common/EdaPageForm';
import { PageFormSection } from '../../../../framework/PageForm/Utils/PageFormSection';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { PlusCircleIcon } from '@patternfly/react-icons';

export interface EventStreamMappingProps {
  rulebook: EdaRulebook;
  mappings: EdaSourceEventMapping[] | undefined;
  setSourceMappings: (sourceMappings: EdaSourceEventMapping[]) => void;
}

export function SourceEventStreamMapping(options: EventStreamMappingProps) {
  const { t } = useTranslation();
  const { control } = useFormContext();

  const {
    fields: mappings,
    append: addMap,
    remove: removeMap,
  } = useFieldArray({
    control,
    name: 'mappings',
  });

  const addMapping = () => {
    const map: EdaSourceEventMapping = {
      source_name: '',
      webhook_id: '',
      webhook_name: '',
      rulebook_hash: '',
    };
    addMap(map);
  };

  useEffect(() => {
    if (options?.mappings) {
      options.mappings.forEach((map) => {
        addMap(map);
      });
    }
  }, [addMap, options.mappings]);

  return (
    <>
      <PageFormSection singleColumn>
        {mappings.map((map, i) => (
          <SourceEventMapFields
            key={i}
            index={i}
            source_mappings={map as unknown as EdaSourceEventMapping}
            onDelete={removeMap}
            rulebook={options?.rulebook}
          />
        ))}
      </PageFormSection>
      <PageFormSection>
        <Button variant="link" icon={<PlusCircleIcon />} onClick={addMapping}>
          {t('Add event stream')}
        </Button>
      </PageFormSection>
    </>
  );
}

/**
 */
export function SourceEventStreamMappingModal(options: EventStreamMappingProps) {
  const { t } = useTranslation();
  const [_, setDialog] = usePageDialog();

  const onClose = () => setDialog(undefined);

  const onSubmit: (values: { mappings: EdaSourceEventMapping[] }) => void = (values) => {
    options.setSourceMappings(values?.mappings);
    onClose();
  };

  return (
    <Modal
      title={t('Event streams')}
      aria-label={t('Event streams')}
      ouiaId={t('Event streams')}
      description={
        <div style={{ marginBottom: 16 }}>
          {t(
            'Attach event streams to swap out sources in your rulebook. Select a source from your rulebook below to see a preview, then select an event stream to swap it with. '
          )}
        </div>
      }
      variant={ModalVariant.large}
      isOpen
      onClose={onClose}
      hasNoBodyWrapper
    >
      <ModalBoxBody style={{ padding: 0 }}>
        <EdaPageForm onSubmit={onSubmit} submitText={t('Save')}>
          <SourceEventStreamMapping {...options} />
        </EdaPageForm>
      </ModalBoxBody>
    </Modal>
  );
}
