import { PageFormGroup } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormGroup';
import { useRequiredValidationRule } from '@ansible/ansible-ui-framework/PageForm/Inputs/validation-hooks';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { TypeaheadSelect } from '@patternfly/react-templates';
import { ReactElement, ReactNode } from 'react';
import {
  Controller,
  FieldPath,
  FieldPathValue,
  FieldValues,
  Validate,
  useFormContext,
  useWatch,
} from 'react-hook-form';
import { awxAPI } from '../../../common/api/awx-utils';

export type PageFormPlaybookSelectProps<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  id?: string;
  name: TFieldName;
  label: string;
  watch: TFieldName;
  labelHelp?: string | string[] | ReactNode;
  labelHelpTitle?: string;
  additionalControls?: ReactElement;
  placeholderText?: string;
  noOptionsFoundMsg?: (filter: string) => string;
  isRequired?: boolean;
  isCreatable?: boolean;
  validate?:
    | Validate<FieldPathValue<TFieldValues, TFieldName>, TFieldValues>
    | Record<string, Validate<FieldPathValue<TFieldValues, TFieldName>, TFieldValues>>;
};

export function PageFormPlaybookSelect<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: PageFormPlaybookSelectProps<TFieldValues, TFieldName>) {
  const {
    watch,
    additionalControls,
    id,
    isRequired = true,
    isCreatable = false,
    label,
    labelHelp,
    labelHelpTitle,
    name,
    placeholderText,
    noOptionsFoundMsg,
    validate,
  } = props;
  const required = useRequiredValidationRule(label, isRequired);

  const { control } = useFormContext<TFieldValues>();
  const projectId: number = useWatch<TFieldValues, TFieldName>({ name: watch });
  const { data: playbooks, error } = useGet<Array<string>>(
    projectId ? awxAPI`/projects/${projectId.toString()}/playbooks/` : undefined
  );
  const options =
    playbooks && !error
      ? playbooks.map((playbook) => ({
          value: playbook,
          content: playbook,
        }))
      : [];

  return (
    <Controller<TFieldValues, TFieldName>
      name={name}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <PageFormGroup
          fieldId={id}
          label={label}
          labelHelp={labelHelp}
          labelHelpTitle={labelHelpTitle}
          helperTextInvalid={error?.message}
          isRequired={isRequired}
          additionalControls={additionalControls}
        >
          <TypeaheadSelect
            isCreatable={isCreatable}
            isDisabled={options.length <= 0}
            id="playbook-typeahead-select"
            isScrollable
            selectOptions={options || []}
            placeholder={placeholderText}
            noOptionsFoundMessage={noOptionsFoundMsg}
            onClearSelection={() => {
              onChange(null);
            }}
            onSelect={(_ev, selectedValue) => {
              const selection = String(selectedValue);
              onChange(selection);
            }}
            selected={value}
          />
        </PageFormGroup>
      )}
      rules={{ required, validate: validate }}
    />
  );
}
