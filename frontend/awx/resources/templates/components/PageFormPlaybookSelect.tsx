import { PageFormGroup } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormGroup';
import { useRequiredValidationRule } from '@ansible/ansible-ui-framework/PageForm/Inputs/validation-hooks';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { TypeaheadSelect } from '@patternfly/react-templates';
import { ReactElement, ReactNode, useEffect, useMemo, useRef } from 'react';
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
    isCreatable = true,
    label,
    labelHelp,
    labelHelpTitle,
    name,
    placeholderText,
    noOptionsFoundMsg,
    validate,
  } = props;
  const required = useRequiredValidationRule(label, isRequired);

  const { control, setValue } = useFormContext<TFieldValues>();
  const projectId: number = useWatch<TFieldValues, TFieldName>({ name: watch });
  const { data: playbooks, error } = useGet<Array<string>>(
    projectId ? awxAPI`/projects/${projectId.toString()}/playbooks/` : undefined
  );

  // Track previous project ID to detect changes
  const previousProjectId = useRef<number | undefined>(undefined);
  const autoSelectedPlaybook = useRef<string | null>(null);

  useEffect(() => {
    // Skip on initial mount
    if (previousProjectId.current === undefined) {
      previousProjectId.current = projectId;
      return;
    }

    // If project changed, clear the playbook and reset auto-selection tracker
    if (previousProjectId.current !== projectId) {
      setValue(name, '' as FieldPathValue<TFieldValues, TFieldName>);
      autoSelectedPlaybook.current = null;
      previousProjectId.current = projectId;
    }
  }, [projectId, setValue, name]);

  const options = useMemo(() => {
    const baseOptions =
      playbooks && !error
        ? playbooks.map((playbook) => ({
            value: playbook,
            content: playbook,
          }))
        : [];

    return baseOptions;
  }, [playbooks, error]);

  return (
    <Controller<TFieldValues, TFieldName>
      name={name}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        // Ensure the current selected value is included in options and marked as selected
        const enhancedOptions = [...options];

        // If we have a selected value that's not in the current options,
        // add it to ensure TypeaheadSelect can display it
        if (value && !enhancedOptions.some((option) => option.value === value)) {
          enhancedOptions.unshift({
            value: value,
            content: value,
          });
        }

        // Auto-select if there's only one playbook and nothing is currently selected
        if (
          !value &&
          enhancedOptions.length === 1 &&
          autoSelectedPlaybook.current !== enhancedOptions[0].value
        ) {
          autoSelectedPlaybook.current = enhancedOptions[0].value;
          onChange(enhancedOptions[0].value);
        }

        // Mark the selected option with selected: true for TypeaheadSelect
        const optionsWithSelection = enhancedOptions.map((option) => ({
          ...option,
          selected: option.value === value,
        }));

        return (
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
              key={`playbook-select-${projectId}-${value || 'none'}`}
              isCreatable={isCreatable}
              isDisabled={options.length <= 0}
              id="playbook-typeahead-select"
              isScrollable
              initialOptions={optionsWithSelection || []}
              placeholder={placeholderText}
              noOptionsFoundMessage={noOptionsFoundMsg}
              onClearSelection={() => {
                onChange(null);
              }}
              onSelect={(_ev, selectedValue) => {
                const selection = String(selectedValue);
                onChange(selection);
              }}
            />
          </PageFormGroup>
        );
      }}
      rules={{ required, validate: validate }}
    />
  );
}
