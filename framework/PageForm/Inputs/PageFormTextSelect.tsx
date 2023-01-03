import { Button, FormGroup, InputGroup, TextInput } from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import { Fragment } from 'react';
import { useController, useFormContext } from 'react-hook-form';

export function FormTextSelect<T>(props: {
  id?: string;
  label: string;
  name: string;
  helperText?: string;
  required?: boolean;
  secret?: boolean;
  autoFocus?: boolean;
  placeholder?: string;
  selectTitle?: string;
  selectValue?: (item: T) => string | number;
  selectOpen?: (callback: (item: T) => void, title: string) => void;
}) {
  const {
    register,
    setValue,
    formState: { isSubmitting },
  } = useFormContext();
  const registration = register(props.name);
  const { fieldState } = useController({ name: props.name });
  const error = fieldState.error;
  let id = props.id ?? props.name;
  id = id.split('.').join('-');
  return (
    <Fragment>
      <FormGroup
        id={`${id}-form-group`}
        fieldId={id}
        label={props.label}
        helperText={props.helperText}
        isRequired={props.required}
        validated={error?.message ? 'error' : undefined}
        helperTextInvalid={error?.message}
      >
        <InputGroup>
          <TextInput
            id={id}
            type={props.secret ? 'password' : 'text'}
            aria-describedby={`${id}-form-group`}
            isRequired={props.required}
            validated={error?.message ? 'error' : undefined}
            autoFocus={props.autoFocus}
            placeholder={props.placeholder}
            {...registration}
            onChange={(v, e) => void registration.onChange(e)}
            // innerRef={registration.ref}
            isReadOnly={isSubmitting}
          />
          <Button
            variant="control"
            onClick={() =>
              props.selectOpen?.((item: T) => {
                if (props.selectValue) {
                  const value = props.selectValue(item);
                  setValue(props.name, value, { shouldValidate: true });
                }
              }, props.selectTitle as string)
            }
            aria-label="Options menu"
            isDisabled={isSubmitting}
          >
            <SearchIcon />
          </Button>
        </InputGroup>
      </FormGroup>
      {/* <SelectDialog
                open={open}
                setOpen={setOpen}
                onClick={(organization: Organization) => {
                    setValue(props.name, organization.name, { shouldValidate: true })
                }}
            /> */}
    </Fragment>
  );
}
