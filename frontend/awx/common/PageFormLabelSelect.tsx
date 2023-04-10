import { useEffect, useState } from 'react';
import { FieldPath, FieldValues } from 'react-hook-form';
import { PageFormCreatableSelect } from '../../../framework/PageForm/Inputs/PageFormCreatableSelect';
import { useTranslation } from 'react-i18next';
import { Label } from '../interfaces/Label';
import { ItemsResponse, requestGet } from '../../common/crud/Data';

/**
 * Component to select and/or create labels in a form
 */
export function PageFormLabelSelect<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(props: {
  labelHelpTitle: string;
  labelHelp: string;
  name: TFieldName;
  placeholderText?: string;
}) {
  const { labelHelpTitle, labelHelp, name, placeholderText } = props;
  const { t } = useTranslation();
  const [labelOptions, setLabels] = useState<Label[]>();

  useEffect(() => {
    async function fetchLabels() {
      const allLabels = [];
      try {
        const labels = await requestGet<ItemsResponse<Label>>(
          `/api/v2/labels/?order_by=name&page=1&page_size=200`
        );
        allLabels.push(...labels.results);
        if (labels.next !== null) {
          const nextLabels = await requestGet<ItemsResponse<Label>>(
            `/api/v2/labels/?order_by=name&page=2&page_size=200`
          );
          allLabels.push(...nextLabels.results);
        }
      } catch (err) {
        /// handle Error
      } finally {
        setLabels(allLabels);
      }
    }
    void fetchLabels();
  }, []);

  return (
    <PageFormCreatableSelect<TFieldValues, TFieldName>
      labelHelpTitle={labelHelpTitle}
      labelHelp={labelHelp}
      name={name}
      placeholderText={placeholderText ?? t('Select or create labels')}
      label={t('Labels')}
      options={
        labelOptions?.map((label) => ({ value: label, label: label.name })) ?? [
          { label: '', value: '' },
        ]
      }
    />
  );
}
