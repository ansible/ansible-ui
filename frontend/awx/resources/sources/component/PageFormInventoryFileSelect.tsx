import { PageFormCreatableSelect } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormCreatableSelect';
import { ReactElement, ReactNode } from 'react';
import { FieldPath, FieldValues, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useGet } from '../../../../common/crud/useGet';
import { awxAPI } from '../../../common/api/awx-utils';
import { InventorySourceForm } from '../../../interfaces/InventorySource';
import { Project } from '../../../interfaces/Project';

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

  const { data: inventories, error } = useGet<Array<string>>(
    awxAPI`/projects/${projectId}/inventories/`
  );

  let inventoryOptions =
    inventories && !error
      ? inventories.map((inventoryFile) => ({
          value: inventoryFile,
          label: inventoryFile,
        }))
      : [];

  inventoryOptions = [
    ...inventoryOptions,
    { value: '/ (project root)', label: t('/ (project root)') },
  ];

  return (
    <PageFormCreatableSelect<InventorySourceForm>
      placeholderText={t('Select inventory file')}
      name="source_path"
      id="inventory"
      additionalControls={props.additionalControls}
      label={t('Inventory file')}
      options={inventoryOptions}
      labelHelpTitle={t('Inventory')}
      labelHelp={
        props.labelHelp ??
        t('Select the inventory containing the playbook you want this job to execute.')
      }
      isRequired={props.isRequired}
      isMulti={false}
    />
  );
}
