import { FieldPath, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { EdaEventStream } from '../interfaces/EdaEventStream';
import { PageFormEdaMultiSelect } from './PageFormEdaMultiSelect';
export function PageFormEventSourceSelect<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: { name: TFieldName; labelHelp: string; isRequired?: boolean; selectOpen: () => void }) {
  const { t } = useTranslation();

  return (
    <PageFormEdaMultiSelect<EdaEventStream>
      {...props}
      name={props.name}
      id="event-stream-select"
      data-cy={'event-streams-select'}
      placeholder={t('Manage event streams')}
      labelHelpTitle={t('Event streams')}
      labelHelp={props.labelHelp}
      label={t('EventStream')}
      selectTitle={t('Manage event streams')}
      selectOpen={props?.selectOpen}
      validate={(EventStreams: EdaEventStream[]) => {
        if (props.isRequired && EventStreams.length === 0) {
          return t('Event stream mapping is required.');
        }
        return undefined;
      }}
      isRequired={props.isRequired}
    />
  );
}
