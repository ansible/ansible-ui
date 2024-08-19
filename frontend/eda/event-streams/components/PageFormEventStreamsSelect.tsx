import { FieldPath, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormMultiInput } from '../../../../framework/PageForm/Inputs/PageFormMultiInput';
import { EdaEventStream } from '../../interfaces/EdaEventStream';
import { useSelectEventStreams } from '../hooks/useSelectEventStreams';

export function PageFormEventStreamSelect<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: { name: TFieldName; labelHelp: string; isRequired?: boolean }) {
  const { t } = useTranslation();
  const selectEventStream = useSelectEventStreams();

  return (
    <PageFormMultiInput<EdaEventStream>
      {...props}
      name={props.name}
      id="webhook-select"
      data-cy={'event-streams-select'}
      placeholder={t('Add event streams')}
      labelHelpTitle={t('Event Streams')}
      labelHelp={props.labelHelp}
      label={t('Event stream')}
      selectTitle={t('Select an event stream')}
      selectOpen={selectEventStream}
      validate={(eventStreams: EdaEventStream[]) => {
        if (props.isRequired && eventStreams.length === 0) {
          return t('Event stream is required.');
        }
        return undefined;
      }}
      isRequired={props.isRequired}
    />
  );
}
