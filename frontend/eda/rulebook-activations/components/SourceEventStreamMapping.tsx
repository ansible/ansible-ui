import { Button, Modal, ModalBoxBody, ModalVariant } from '@patternfly/react-core';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PageDetail,
  PageDetails,
  PageFormSubmitHandler,
  usePageDialog,
} from '../../../../framework';
import { SourceEventMapFields } from './SourceEventMapFields';
import { EdaRulebook } from '../../interfaces/EdaRulebook';
import { EdaSource, EdaSourceEventMapping } from '../../interfaces/EdaSource';
import { EdaPageForm } from '../../common/EdaPageForm';
import { PageFormSection } from '../../../../framework/PageForm/Utils/PageFormSection';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { useGet } from '../../../common/crud/useGet';
import { EdaResult } from '../../interfaces/EdaResult';
import { edaAPI } from '../../common/eda-utils';

export interface EventStreamMappingProps {
  rulebook: EdaRulebook;
  mappings: EdaSourceEventMapping[] | undefined;
  setSourceMappings: (sourceMappings: EdaSourceEventMapping[]) => void;
}

export function SourceEventStreamMapping(options: EventStreamMappingProps) {
  const { t } = useTranslation();
  const { control, setValue } = useFormContext();

  const {
    fields: mappings,
    append: addMap,
    remove: removeMap,
  } = useFieldArray({
    control,
    name: 'mappings',
    shouldUnregister: false,
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
  const { data: sources } = useGet<EdaResult<EdaSource>>(
    edaAPI`/rulebooks/` + `${options?.rulebook?.id}/sources/?page=1&page_size=200`
  );

  useEffect(() => {
    setValue('mappings', options.mappings);
  }, [setValue, options.mappings]);

  return (
    <>
      <PageFormSection singleColumn>
        <PageDetails numberOfColumns={'two'}>
          <PageDetail label={t('Rulebook')}>{options?.rulebook?.name}</PageDetail>
          <PageDetail label={t('Number of sources')}>{sources?.count}</PageDetail>
        </PageDetails>
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
        <Button
          variant="link"
          icon={<PlusCircleIcon />}
          style={{ paddingLeft: 0 }}
          data-cy={'add_event_stream'}
          onClick={addMapping}
        >
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

  const onSubmit: PageFormSubmitHandler<{ mappings: EdaSourceEventMapping[] }> = (values) => {
    options.setSourceMappings(values.mappings);
    onClose();
    return Promise.resolve();
  };

  return (
    <Modal
      title={t('Event streams')}
      aria-label={t('Event streams')}
      ouiaId={t('Event streams')}
      data-cy={t('event-streams')}
      description={
        <div style={{ fontSize: 'small' }}>
          {t(
            'Event streams represent server side webhooks which ease the routing issues related to running webhooks individually in a container or a pod. ' +
              'You can swap the sources in your rulebook with a matching event stream. Typically the sources to swap out are of the type ansible.eda.rulebook, ' +
              'but you may also be able to swap out your own webhook source plugins. The swapping process replaces just the source type and args and leaves your ' +
              'filters intact. We swap out the webhook source type with a source of type ansible.eda.pg_listener.'
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
