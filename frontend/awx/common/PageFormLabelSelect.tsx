import { ReactElement } from 'react';
import { FieldPath, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormCreatableSelect } from '../../../framework/PageForm/Inputs/PageFormCreatableSelect';
import { Label } from '../interfaces/Label';
import { awxAPI } from './api/awx-utils';
import { useAwxGetAllPages } from './useAwxGetAllPages';

/**
 * Component to select and/or create labels in a form
 */
export function PageFormLabelSelect<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: {
  labelHelpTitle: string;
  labelHelp: string;
  name: TFieldName;
  placeholderText?: string;
  additionalControls?: ReactElement;
}) {
  const { labelHelpTitle, labelHelp, name, placeholderText, additionalControls } = props;
  const { t } = useTranslation();

  const { results, isLoading } = useAwxGetAllPages<Label>(awxAPI`/labels/`, { order_by: 'name' });
  const options = isLoading ? [{ name: '' }] : results;
  return (
    <PageFormCreatableSelect<TFieldValues, TFieldName>
      labelHelpTitle={labelHelpTitle}
      labelHelp={labelHelp}
      name={name}
      placeholderText={placeholderText ?? t('Select or create labels')}
      label={t('Labels')}
      additionalControls={additionalControls ?? undefined}
      options={
        options?.map((label) => ({ value: label, label: label.name })) ?? [{ label: '', value: '' }]
      }
    />
  );
}
