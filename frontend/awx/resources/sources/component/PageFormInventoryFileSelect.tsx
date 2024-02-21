import { ReactElement, ReactNode, useCallback } from 'react';
import { FieldPath, FieldValues, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormAsyncSelect } from '../../../../../framework/PageForm/Inputs/PageFormAsyncSelect';
import { awxAPI } from '../../../common/api/awx-utils';
import { Inventory } from '../../../interfaces/Inventory';
import { Project } from '../../../interfaces/Project';
import { requestGet } from '../../../../common/crud/Data';

export function PageFormInventoryFileSelect<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: {
  watch: string;
  name: TFieldName;
  isRequired?: boolean;
  additionalControls?: ReactElement;
  labelHelp?: string | string[] | ReactNode;
}) {
  const { t } = useTranslation();
  const value = useWatch({ name: props.watch }) as Project;
  const projectId = value?.id?.toString() ?? '';
  const query = useCallback(async () => {
    const response = projectId
      ? await requestGet<Array<string>>(awxAPI`/projects/${projectId}/inventories/`)
      : [];
    const newResponse = response.map((str) => ({
      name: str,
    }));
    return Promise.resolve({
      total: newResponse.length,
      values: [{ name: '/ (project root)' }, ...newResponse],
    });
  }, [projectId]);

  return (
    <PageFormAsyncSelect<TFieldValues>
      name={props.name}
      id="inventory"
      variant="typeahead"
      additionalControls={props.additionalControls}
      label={t('Inventory file')}
      query={query}
      valueToString={(value) => (value as Inventory)?.name ?? ''}
      placeholder={t('Select inventory file')}
      labelHelpTitle={t('Inventory')}
      labelHelp={
        props.labelHelp ??
        t('Select the inventory containing the playbook you want this job to execute.')
      }
      loadingPlaceholder={t('Loading inventories...')}
      loadingErrorText={t('Error loading inventories')}
      isRequired={props.isRequired}
      limit={200}
    />
  );
}
