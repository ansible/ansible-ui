import { FieldPath, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormMultiInput } from '../../../../framework/PageForm/Inputs/PageFormMultiInput';
import { EdaWebhook } from '../../interfaces/EdaWebhook';
import { useSelectWebhooks } from '../hooks/useSelectWebhooks';

export function PageFormWebhookSelect<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: { name: TFieldName; labelHelp: string; isRequired?: boolean }) {
  const { t } = useTranslation();
  const selectWebhook = useSelectWebhooks();

  return (
    <PageFormMultiInput<EdaWebhook>
      {...props}
      name={props.name}
      id="webhook-select"
      data-cy={'webhooks-select'}
      placeholder={t('Add event streams')}
      labelHelpTitle={t('Event Streams')}
      labelHelp={props.labelHelp}
      label={t('Event stream')}
      selectTitle={t('Select an event stream')}
      selectOpen={selectWebhook}
      validate={(webhooks: EdaWebhook[]) => {
        if (props.isRequired && webhooks.length === 0) {
          return t('Event stream is required.');
        }
        return undefined;
      }}
      isRequired={props.isRequired}
    />
  );
}
