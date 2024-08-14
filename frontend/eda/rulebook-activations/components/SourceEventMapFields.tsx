import { Button, FormFieldGroupExpandable, FormFieldGroupHeader } from '@patternfly/react-core';
import { TrashIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useFormContext, useWatch } from 'react-hook-form';
import { PageFormTextArea } from '../../../../framework';
import { EdaSource, EdaSourceEventMapping } from '../../interfaces/EdaSource';
import { EdaRulebook } from '../../interfaces/EdaRulebook';
import { EdaWebhook } from '../../interfaces/EdaWebhook';
import { PageFormSingleSelect } from '../../../../framework/PageForm/Inputs/PageFormSingleSelect';
import { useCallback, useEffect } from 'react';

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
  const { register, setValue, getValues } = useFormContext();
  const selectedSource = useWatch({ name: `mappings.${index}.source_name` }) as string;
  const mappings: EdaSourceEventMapping[] = getValues('mappings') as EdaSourceEventMapping[];

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

  const getSourceOptions = useCallback(() => {
    let sources = sourceOptions;
    if (sourceOptions && mappings && mappings.length > 1) {
      sources = sourceOptions.filter((src) => {
        return !mappings.find((item) => {
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
  }, [mappings, selectedSource, sourceOptions]);

  const getEventOptions = useCallback(() => {
    let events = eventOptions;

    if (eventOptions && mappings && mappings.length > 1) {
      events = eventOptions.filter((ev) => {
        return !mappings.find((item) => {
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
  }, [eventOptions, mappings, selectedEvent]);

  useEffect(() => {
    getEventOptions();
    getSourceOptions();
  }, [getEventOptions, getSourceOptions, selectedSource, selectedEvent]);

  return (
    <FormFieldGroupExpandable
      isExpanded
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
      <PageFormSingleSelect
        name={`mappings.${index}.source_name`}
        label={t('Source')}
        placeholder={t('Select source')}
        isRequired
        labelHelp={t('Sources in the rulebook.')}
        labelHelpTitle={t('Sources')}
        options={getSourceOptions()}
      />
      <PageFormSingleSelect
        name={`mappings.${index}.webhook_id`}
        label={t('Event stream')}
        placeholder={t('Select event stream')}
        isRequired
        labelHelp={t('Event stream to swap with the source.')}
        labelHelpTitle={t('Event streams')}
        options={getEventOptions()}
      />
      <PageFormTextArea
        name={`${index}.source_info`}
        label={t('Preview of source from rulebook')}
        isReadOnly
      />
      <input type="hidden" {...register(`mappings.${index}.rulebook_hash`)} />
    </FormFieldGroupExpandable>
  );
}
