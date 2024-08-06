import { Button, FormFieldGroup, FormFieldGroupHeader } from '@patternfly/react-core';
import { TrashIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useFormContext, useWatch } from 'react-hook-form';
import { PageFormTextArea } from '../../../../framework';
import { PageFormSection } from '../../../../framework/PageForm/Utils/PageFormSection';
import { EdaSource, EdaSourceEventMapping } from '../../interfaces/EdaSource';
import { edaAPI } from '../../common/eda-utils';
import { EdaResult } from '../../interfaces/EdaResult';
import { EdaRulebook } from '../../interfaces/EdaRulebook';
import { useGet } from '../../../common/crud/useGet';
import { EdaWebhook } from '../../interfaces/EdaWebhook';
import { PageFormSingleSelect } from '../../../../framework/PageForm/Inputs/PageFormSingleSelect';

export function SourceEventMapFields(props: {
  index: number;
  rulebook: EdaRulebook;
  source_mappings: EdaSourceEventMapping;
  onDelete: (id: number) => void;
}) {
  const { t } = useTranslation();
  const { index, onDelete } = props;
  const { register, setValue } = useFormContext();

  const { data: sources } = useGet<EdaResult<EdaSource>>(
    edaAPI`/rulebooks/` + `${props?.rulebook?.id}/sources/?page=1&page_size=200`
  );
  const { data: events } = useGet<EdaResult<EdaWebhook>>(edaAPI`/webhooks/?page=1&page_size=200`);

  const selectedSource = useWatch({ name: `mappings.${index}.source_name` }) as string;
  let srcIndex = -1;
  if (sources?.results) {
    srcIndex = sources.results.findIndex((source) => source.name === selectedSource);

    if (srcIndex > -1) {
      setValue(`${index}.source_info`, sources.results[srcIndex].source_info);
      setValue(`mappings.${index}.rulebook_hash`, sources.results[srcIndex].rulebook_hash);
    }
  }
  const selectedEvent = useWatch({ name: `mappings.${index}.webhook_id` }) as number;
  let evIndex = -1;
  if (events?.results) {
    evIndex = events.results.findIndex((event) => event.id === selectedEvent);

    if (evIndex > -1) {
      setValue(`mappings.${index}.webhook_name`, events.results[evIndex].name);
    }
  }

  return (
    <PageFormSection singleColumn>
      <FormFieldGroup
        header={
          <FormFieldGroupHeader
            titleText={{ text: t('Event string'), id: `Mapping ${index}` }}
            actions={
              <>
                <Button
                  id={`map-delete-${index}`}
                  icon={<TrashIcon />}
                  aria-label={t('Delete map')}
                  onClick={() => onDelete(index)}
                  variant="plain"
                />
              </>
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
          options={
            sources?.results
              ? sources.results.map((item: { name: string }) => ({
                  label: item.name,
                  value: item.name,
                }))
              : []
          }
        />
        <PageFormSingleSelect
          name={`mappings.${index}.webhook_id`}
          label={t('Event stream')}
          placeholder={t('Select event stream')}
          isRequired
          labelHelp={t('Event stream to swap with the source.')}
          labelHelpTitle={t('Event streams')}
          options={
            events?.results
              ? events.results.map((item: { name: string; id: number }) => ({
                  label: item.name,
                  value: item.id,
                }))
              : []
          }
        />
        <PageFormTextArea
          name={`${index}.source_info`}
          label={t('Preview of source from rulebook')}
          isReadOnly
        />
        <input type="hidden" {...register(`mappings.${index}.rulebook_hash`)} />
      </FormFieldGroup>
    </PageFormSection>
  );
}
