import { FormGroup, Switch } from '@patternfly/react-core';
import { useController, useFormContext } from 'react-hook-form';

export function PageFormSwitch(props: {
  id?: string;
  label: string;
  labelOn?: string;
  labelOff?: string;
  name: string;
  helperText?: string;
  required?: boolean;
  autoFocus?: boolean;
}) {
  const {
    formState: { isSubmitting },
  } = useFormContext();
  const { field, fieldState } = useController({ name: props.name });
  const error = fieldState.error;
  const id = props.id ?? props.name;
  return (
    <FormGroup
      id={`${id}-form-group`}
      fieldId={id}
      label={props.label}
      helperText={props.helperText}
      isRequired={props.required}
      validated={error?.message ? 'error' : undefined}
      helperTextInvalid={error?.message}
    >
      <Switch
        id={id}
        label={props.labelOn}
        labelOff={props.labelOff}
        aria-describedby={`${id}-form-group`}
        // isRequired={props.required}
        // validated={error?.message ? 'error' : undefined}
        autoFocus={props.autoFocus}
        // placeholder={props.placeholder}
        // {...registration}
        isChecked={typeof field.value === 'boolean' ? field.value : false}
        onChange={(e) => field.onChange(e)}
        // innerRef={registration.ref}
        isDisabled={isSubmitting}
      />
    </FormGroup>
  );
}
