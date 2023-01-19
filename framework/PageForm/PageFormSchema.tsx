import { StringOptions, Type } from '@sinclair/typebox';
import { JSONSchema6 } from 'json-schema';
import { ReactNode } from 'react';
import { FieldValues } from 'react-hook-form';
import { IFormGroupSelectOption } from './Inputs/FormGroupSelectOption';
import { PageFormSelectOption, PageFormSelectOptionProps } from './Inputs/PageFormSelectOption';
import { PageFormSlider } from './Inputs/PageFormSlider';
import { PageFormSwitch } from './Inputs/PageFormSwitch';
import { PageFormTextArea } from './Inputs/PageFormTextArea';
import { PageFormTextInput } from './Inputs/PageFormTextInput';
import { FormTextSelect } from './Inputs/PageFormTextSelect';

export function PageFormSchema(props: { schema: JSONSchema6; base?: string }) {
  const { schema } = props;
  const base = props.base ? props.base + '.' : '';

  const p: ReactNode[] = [];

  for (const propertyName in schema.properties) {
    const property = schema.properties[propertyName];

    switch (property) {
      case true:
      case false:
        continue;
    }

    const title = typeof property.title === 'string' ? property.title : propertyName;
    const description = typeof property.description === 'string' ? property.description : undefined;

    const required = Array.isArray(schema.required) && schema.required.includes(propertyName);

    const prop = property as {
      placeholder?: string;
      errorMessage?: Record<string, string>;
      variant: string;
    } & JSONSchema6;
    prop.errorMessage = prop.errorMessage ?? {};
    switch (property.type) {
      case 'string':
        switch (prop.variant) {
          case 'select':
            {
              if (!prop.placeholder) {
                prop.placeholder = `Select ${(property.title ?? propertyName).toLowerCase()}`;
              }
              if (!prop.enum) {
                prop.enum = (prop as unknown as TypeSelectOptions<string>).options?.map(
                  (option) => option.value
                );
              }
            }
            break;

          default:
            {
              if (!prop.placeholder) {
                prop.placeholder = `Enter ${(property.title ?? propertyName).toLowerCase()}`;
              }
              if (property.minLength) {
                if (!prop.errorMessage.minLength) {
                  prop.errorMessage.minLength = `${
                    property.title ?? propertyName
                  } must be at least ${property.minLength} characters.`;
                }
              } else if (required) {
                property.minLength = 1;
                prop.errorMessage.minLength = `${property.title ?? propertyName} is required`;
              }
              if (property.maxLength) {
                if (!prop.errorMessage.maxLength) {
                  prop.errorMessage.maxLength = `${
                    property.title ?? propertyName
                  } must be less than ${property.maxLength} characters.`;
                }
              }
            }
            break;
        }
        break;
    }

    let placeholder: string | undefined = (property as { placeholder?: string }).placeholder;
    placeholder = typeof placeholder === 'string' ? placeholder : undefined;

    switch (property.type) {
      case 'string': {
        switch ((property as { variant?: string }).variant) {
          case 'select': {
            if ('options' in property) {
              const formSelectProps = property as unknown as PageFormSelectOptionProps<FieldValues>;
              p.push(
                <PageFormSelectOption
                  id={base + propertyName}
                  key={base + propertyName}
                  name={base + propertyName}
                  label={title}
                  placeholderText={placeholder}
                  isRequired={required}
                  options={formSelectProps.options}
                  footer={formSelectProps.footer}
                  labelHelpTitle={title}
                  labelHelp={description}
                />
              );
            } else {
              p.push(
                <FormTextSelect
                  key={base + propertyName}
                  name={base + propertyName}
                  label={title}
                  placeholder={placeholder}
                  required={required}
                  selectTitle={(property as { selectTitle?: string }).selectTitle}
                  selectValue={
                    (
                      property as {
                        selectValue?: (organization: unknown) => string | number;
                      }
                    ).selectValue
                  }
                  selectOpen={
                    (
                      property as {
                        selectOpen?: (callback: (item: unknown) => void, title: string) => void;
                      }
                    ).selectOpen
                  }
                />
              );
            }
            break;
          }
          case 'textarea':
            p.push(
              <PageFormTextArea
                id={base + propertyName}
                key={base + propertyName}
                name={base + propertyName}
                label={title}
                placeholder={placeholder}
                isRequired={required}
              />
            );
            break;
          case 'secret':
            {
              const typeSecretInputOptions = property as TypeSecretInputOptions;
              p.push(
                <PageFormTextInput
                  id={base + propertyName}
                  key={base + propertyName}
                  name={base + propertyName}
                  label={title}
                  placeholder={placeholder}
                  isRequired={required}
                  type="password"
                  autoComplete={typeSecretInputOptions.autoComplete}
                />
              );
            }
            break;
          default:
            {
              const typeTextInputOptions = property as TypeTextInputOptions;
              p.push(
                <PageFormTextInput
                  id={base + propertyName}
                  key={base + propertyName}
                  name={base + propertyName}
                  label={title}
                  placeholder={placeholder}
                  isRequired={required}
                  autoComplete={typeTextInputOptions.autoComplete}
                />
              );
            }
            break;
        }
        break;
      }
      case 'number': {
        p.push(
          <PageFormSlider
            key={base + propertyName}
            name={base + propertyName}
            label={title}
            required={required}
            min={(property as { min?: number }).min}
            max={(property as { max?: number }).max}
            valueLabel={(property as { valueLabel?: string }).valueLabel}
          />
        );
        break;
      }
      case 'boolean': {
        p.push(
          <PageFormSwitch
            key={base + propertyName}
            name={base + propertyName}
            label={title}
            required={required}
          />
        );
        break;
      }
      case 'object': {
        p.push(<PageFormSchema key={propertyName} schema={property} base={base + propertyName} />);
        break;
      }
    }
  }

  return <>{p}</>;
}

export type TypeTextInputOptions = StringOptions<string> & {
  placeholder?: string;
  /** https://www.chromium.org/developers/design-documents/create-amazing-password-forms/ */
  autoComplete?: string;
};

export function TypeTextInput(options: TypeTextInputOptions) {
  return Type.String({ ...options });
}

export type TypeSecretInputOptions = StringOptions<string> & {
  placeholder?: string;
  /** https://www.chromium.org/developers/design-documents/create-amazing-password-forms/ */
  autoComplete: string;
};

export function TypeSecretInput(options: TypeSecretInputOptions) {
  return Type.String({ ...options, variant: 'secret' });
}

export type TypeSelectOptions<T> = StringOptions<string> & {
  placeholder?: string;
  options: IFormGroupSelectOption<T>[];
};

export function TypeSelect<T extends string | number>(options: TypeSelectOptions<T>) {
  return Type.String({ ...options, variant: 'select' });
}
