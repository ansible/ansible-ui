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
      placeholder={t('Add webhooks')}
      labelHelpTitle={t('Webhooks')}
      labelHelp={props.labelHelp}
      label={t('Webhook')}
      selectTitle={t('Select a webhook')}
      selectOpen={selectWebhook}
      validate={(webhooks: EdaWebhook[]) => {
        if (props.isRequired && webhooks.length === 0) {
          return t('Webhook is required.');
        }
        return undefined;
      }}
      isRequired={props.isRequired}
    />
  );
}
