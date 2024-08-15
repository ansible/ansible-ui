import { Button, FormFieldGroup, FormFieldGroupHeader } from '@patternfly/react-core';
import { TrashIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useFormContext, useWatch } from 'react-hook-form';
import { PageFormTextArea } from '../../../../framework';
import { EdaSource, EdaSourceEventMapping } from '../../interfaces/EdaSource';
import { EdaRulebook } from '../../interfaces/EdaRulebook';
import { EdaWebhook } from '../../interfaces/EdaWebhook';
import { PageFormSingleSelect } from '../../../../framework/PageForm/Inputs/PageFormSingleSelect';
import React, { useCallback, useEffect } from 'react';

export function FormSingleSelectEventStream(props: {
  name: string;
  eventOptions: EdaWebhook[] | undefined;
  selectedEvent: number;
}) {
  const { name, eventOptions, selectedEvent } = props;
  const { t } = useTranslation();
  const { getValues } = useFormContext();

  const getEventOptions = () => {
    let events = eventOptions;
    const mappingsNow = getValues('mappings') as EdaSourceEventMapping[];
    if (eventOptions && mappingsNow && mappingsNow.length > 1) {
      events = eventOptions.filter((ev) => {
        return !mappingsNow.find((item) => {
          return parseInt(item.webhook_id, 10) === selectedEvent
            ? false
            : item?.webhook_name === ev.name;
        });
      });
    }
    return events
      ? events.map((item: { name: string; id: number }) => ({
          label: item.name,
          value: item.id,
        }))
      : [];
  };

  return (
    <PageFormSingleSelect
      name={name}
      label={t('Event stream')}
      placeholder={t('Select event stream')}
      isRequired
      labelHelp={t('Event streams to swap with the selected source.')}
      labelHelpTitle={t('Event stream')}
      options={getEventOptions()}
    />
  );
}

export function FormSingleSelectSource(props: {
  name: string;
  sourceOptions: EdaSource[] | undefined;
  selectedSource: string;
}) {
  const { name, sourceOptions, selectedSource } = props;
  const { t } = useTranslation();
  const { getValues } = useFormContext();

  const getSourceOptions = useCallback(() => {
    const mappingsNow = getValues('mappings') as EdaSourceEventMapping[];
    let sources = sourceOptions;
    if (sourceOptions && mappingsNow && mappingsNow.length > 1) {
      sources = sourceOptions.filter((src) => {
        return !mappingsNow.find((item) => {
          return item.source_name === selectedSource ? false : item?.source_name === src.name;
        });
      });
    }
    return sources
      ? sources.map((item: { name: string }) => ({
          label: item.name,
          value: item.name,
        }))
      : [];
  }, [getValues, selectedSource, sourceOptions]);

  return (
    <PageFormSingleSelect
      name={name}
      label={t('Rulebook source')}
      placeholder={t('Select rulebook source')}
      isRequired
      labelHelp={t(
        'A rulebook can contain multiple sources across multiple rulesets. You can map the same rulebook in ' +
          'multiple activations to multiple event streams. While managing event streams, unnamed sources are assigned ' +
          'temporary names (__SOURCE {n}) for identification purposes.'
      )}
      labelHelpTitle={t('Rulebook source')}
      options={getSourceOptions()}
    />
  );
}

export function SourceEventMapFields(props: {
  index: number;
  rulebook: EdaRulebook;
  source_mappings: EdaSourceEventMapping;
  sourceOptions: EdaSource[] | undefined;
  eventOptions: EdaWebhook[] | undefined;
  onDelete: (id: number) => void;
}) {
  const { t } = useTranslation();
  const { index, sourceOptions, eventOptions, onDelete } = props;
  const { register, setValue } = useFormContext();
  const selectedSource = useWatch({ name: `mappings.${index}.source_name` }) as string;
  //const mappings: EdaSourceEventMapping[] = getValues('mappings') as EdaSourceEventMapping[];

  const setSourceInfo = useCallback(() => {
    let srcIndex = -1;
    if (sourceOptions) {
      srcIndex = sourceOptions.findIndex((source) => source.name === selectedSource);

      if (srcIndex > -1) {
        setValue(`${index}.source_info`, sourceOptions[srcIndex].source_info);
        setValue(`mappings.${index}.rulebook_hash`, sourceOptions[srcIndex].rulebook_hash);
      }
    }
  }, [index, selectedSource, setValue, sourceOptions]);

  useEffect(() => {
    setSourceInfo();
  }, [setSourceInfo]);

  const selectedEvent = useWatch({ name: `mappings.${index}.webhook_id` }) as number;

  const setEventInfo = useCallback(() => {
    let evIndex = -1;
    if (eventOptions) {
      evIndex = eventOptions.findIndex((event) => event.id === selectedEvent);

      if (evIndex > -1) {
        setValue(`mappings.${index}.webhook_name`, eventOptions[evIndex].name);
      }
    }
  }, [eventOptions, index, selectedEvent, setValue]);

  useEffect(() => {
    setEventInfo();
  }, [setEventInfo]);

  return (
    <FormFieldGroup
      header={
        <FormFieldGroupHeader
          titleText={{ text: t('Mapping ') + `${index + 1}`, id: `Mapping ${index}` }}
          data-cy={'mapping-header-' + `${index}`}
          actions={
            <Button
              id={`map-delete-${index}`}
              icon={<TrashIcon />}
              aria-label={t('Delete map')}
              onClick={() => onDelete(index)}
              variant="plain"
            />
          }
        />
      }
    >
      <FormSingleSelectSource
        name={`mappings.${index}.source_name`}
        sourceOptions={sourceOptions}
        selectedSource={selectedSource}
      />

      <FormSingleSelectEventStream
        name={`mappings.${index}.webhook_id`}
        eventOptions={eventOptions}
        selectedEvent={selectedEvent}
      />
      <PageFormTextArea
        name={`${index}.source_info`}
        label={t('Preview of source from rulebook')}
        isReadOnly
      />
      <input type="hidden" {...register(`mappings.${index}.rulebook_hash`)} />
    </FormFieldGroup>
  );
}
