import { Select, SelectOption, SelectVariant } from '@patternfly/react-core/deprecated';
import React from 'react';
import { useController, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormGroup } from '../../../../../framework/PageForm/Inputs/PageFormGroup';

interface FieldOptions {
  id: string;
  label: string;
  help_text?: string;
}

interface BecomeMethodFieldProps {
  fieldOptions: FieldOptions;
  isRequired: boolean;
}
// This component was migrated from the previous UI version, see:
// https://github.com/ansible/awx/blob/918d5b3565e5997bdbd57117b92852ba13bb55d6/awx/ui/src/screens/Credential/shared/CredentialFormFields/BecomeMethodField.js#L13

export function BecomeMethodField({ fieldOptions, isRequired }: BecomeMethodFieldProps) {
  const { t } = useTranslation();
  const { control } = useFormContext();
  const {
    field,
    fieldState: { error },
  } = useController({
    name: `${fieldOptions.id}`,
    control,
    rules: { required: isRequired },
  });

  const value = field.value as string;
  const onChange = field.onChange;

  const [isOpen, setIsOpen] = React.useState(false);
  const [options, setOptions] = React.useState(
    [
      'sudo',
      'su',
      'pbrun',
      'pfexec',
      'dzdo',
      'pmrun',
      'runas',
      'enable',
      'doas',
      'ksu',
      'machinectl',
      'sesu',
    ].map((val) => ({ value: val }))
  );

  return (
    <PageFormGroup
      fieldId={`${fieldOptions.id}`}
      helperTextInvalid={error ? error.message : ''}
      label={fieldOptions.label}
      labelHelp={fieldOptions.help_text}
      isRequired={isRequired}
    >
      <Select
        typeAheadAriaLabel={fieldOptions.label}
        maxHeight={200}
        variant={SelectVariant.typeahead}
        onToggle={(event, isExpanded) => setIsOpen(isExpanded)}
        onClear={() => onChange('')}
        onSelect={(event, option) => {
          onChange(option);
          setIsOpen(false);
        }}
        isOpen={isOpen}
        data-cy="select-become-method"
        id="select-become-method"
        selections={value}
        isCreatable
        onCreateOption={(option) => {
          setOptions((prevOptions) => [...prevOptions, { value: option }]);
          onChange(option);
        }}
        noResultsFoundText={t('No results found')}
        createText={t('Create')}
      >
        {options.map((option) => (
          <SelectOption key={option.value} value={option.value} />
        ))}
      </Select>
    </PageFormGroup>
  );
}
