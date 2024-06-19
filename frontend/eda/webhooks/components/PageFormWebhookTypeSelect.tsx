import { FieldPath, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormSingleSelectEdaResource } from '../../common/PageFormSingleSelectEdaResource';

import { useCredentialTypesColumns } from '../../access/credential-types/hooks/useCredentialTypesColumns';
import { useCredentialTypeFilters } from '../../access/credential-types/hooks/useCredentialTypeFilters';
import { EdaCredentialType } from '../../interfaces/EdaCredentialType';
import { edaAPI } from '../../common/eda-utils';

/**
 * A form input for selecting an webhookType.
 *
 * @example
 * ```tsx
 * <PageFormSelectWebhookType<Credential> name="webhookType" />
 * ```
 */
export function PageFormSelectWebhookType<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: { name: TFieldName; isRequired?: boolean; isDisabled?: string; helperText?: string }) {
  const { t } = useTranslation();
  const webhookTypeColumns = useCredentialTypesColumns();
  const webhookTypeFilters = useCredentialTypeFilters();
  return (
    <PageFormSingleSelectEdaResource<EdaCredentialType, TFieldValues, TFieldName>
      name={props.name}
      id="webhook_type_id"
      label={t('Webhook type')}
      placeholder={t('Select webhook type')}
      queryPlaceholder={t('Loading webhook types...')}
      queryErrorText={t('Error loading webhook types')}
      isRequired={props.isRequired}
      isDisabled={props.isDisabled}
      helperText={props.helperText}
      url={edaAPI`/credential-types/`}
      queryParams={{ namespace: 'webhook' }}
      tableColumns={webhookTypeColumns}
      toolbarFilters={webhookTypeFilters}
    />
  );
}
