import {
  PageDetail,
  PageDetails,
  PageFormSubmitHandler,
  usePageDialog,
} from '@ansible/ansible-ui-framework';
import { PageFormSection } from '@ansible/ansible-ui-framework/PageForm/Utils/PageFormSection';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { Button, Modal, ModalVariant, ModalHeader, ModalBody } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { useCallback, useEffect } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { edaAPI } from '../../common/eda-utils';
import { EdaPageForm } from '../../common/EdaPageForm';
import { EdaEventStream } from '../../interfaces/EdaEventStream';
import { EdaResult } from '../../interfaces/EdaResult';
import { EdaRulebook } from '../../interfaces/EdaRulebook';
import { EdaSource, EdaSourceEventMapping } from '../../interfaces/EdaSource';
import { SourceEventMapFields } from './SourceEventMapFields';

export interface EventStreamMappingProps {
  rulebook: EdaRulebook;
  mappings: EdaSourceEventMapping[] | undefined;
  setSourceMappings: (sourceMappings: EdaSourceEventMapping[]) => void;
}

export function SourceEventStreamMapping(options: EventStreamMappingProps) {
  const { t } = useTranslation();
  const { setValue, getFieldState, control } = useFormContext();

  const {
    fields: mappings,
    append: addMap,
    remove: removeMap,
  } = useFieldArray({
    control,
    name: 'mappings',
  });

  const addMapping = useCallback(() => {
    const map: EdaSourceEventMapping = {
      source_name: '',
      event_stream_id: '',
      event_stream_name: '',
      rulebook_hash: '',
    };
    addMap(map);
  }, [addMap]);

  const { data: sources } = useGet<EdaResult<EdaSource>>(
    edaAPI`/rulebooks/` + `${options?.rulebook?.id}/sources/?page=1&page_size=200`
  );
  const { data: events } = useGet<EdaResult<EdaEventStream>>(
    edaAPI`/event-streams/?test_mode=false&page=1&page_size=200`
  );

  useEffect(() => {
    setValue(
      'mappings',
      !!options.mappings && options.mappings.length > 0
        ? options.mappings
        : [
            {
              source_name: '',
              event_stream_id: '',
              event_stream_name: '',
              rulebook_hash: '',
            },
          ]
    );
  }, [setValue, options.mappings]);

  return (
    <>
      <PageFormSection singleColumn>
        <PageDetails numberOfColumns={'two'}>
          <PageDetail label={t('Rulebook')}>{options?.rulebook?.name}</PageDetail>
          <PageDetail label={t('Number of sources')}>{sources?.count}</PageDetail>
        </PageDetails>
        {mappings.map((mapping, i) => (
          <SourceEventMapFields
            data-cy={`source-event-map-field-${mapping.id}`}
            data-testid={`source-event-map-field-${mapping.id}`}
            key={mapping.id}
            index={i}
            source_mappings={mapping as unknown as EdaSourceEventMapping}
            sourceOptions={sources?.results}
            eventOptions={events?.results}
            onDelete={removeMap}
            rulebook={options?.rulebook}
          />
        ))}
      </PageFormSection>
      {!(
        mappings &&
        (mappings.length >= (sources?.count ?? 0) || mappings.length >= (events?.count ?? 0))
      ) && (
        <PageFormSection>
          <Button
            variant="link"
            icon={<PlusCircleIcon />}
            style={{ paddingLeft: 0 }}
            data-cy={'add_event_stream'}
            data-testid={'add_event_stream'}
            onClick={() => addMapping()}
            isDisabled={getFieldState('mappings').invalid}
          >
            {t('Add event stream')}
          </Button>
        </PageFormSection>
      )}
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
    onClose();
    options.setSourceMappings(values.mappings);
    return Promise.resolve();
  };

  return (
    <Modal
      aria-label={t('Event streams')}
      ouiaId={'Event streams'}
      data-cy={'event-streams-modal'}
      data-testid={'event-streams-modal'}
      variant={ModalVariant.large}
      isOpen
      onClose={onClose}
    >
      <ModalHeader
        title={t('Event streams')}
        description={
          <div style={{ fontSize: 'small' }}>
            {t(
              'Event streams are server-side webhooks that enable you to connect various event sources to your rulebook activations. ' +
                'To add event streams to your rulebooks, replace an ansible.eda.webhook or compatible custom source with the desired event stream. ' +
                'This modifies the activation only, while leaving your filters intact.'
            )}
          </div>
        }
      />
      <ModalBody style={{ paddingBottom: 0 }}>
        <EdaPageForm
          onSubmit={onSubmit}
          submitText={t('Save')}
          cancelText={t('Cancel')}
          onCancel={onClose}
        >
          <SourceEventStreamMapping {...options} />
        </EdaPageForm>
      </ModalBody>
    </Modal>
  );
}
