import { Button, Icon, InputGroup } from '@patternfly/react-core';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyIcon, RedoIcon } from '@patternfly/react-icons';
import { PageFormFileUpload } from '../../../../../framework/PageForm/Inputs/PageFormFileUpload';
import { CredentialInputField } from '../../../interfaces/CredentialType';
import { CredentialTextInput } from '../CredentialForm';

interface ChildProps {
  labelHelp?: string;
  label?: string;
}

interface EncryptedInputButtonsProps {
  onClear: () => void;
  isDisabled?: boolean;
}

/**
 * Props for the SecretManagementInputField component.
 * @interface IProps
 */
interface IProps {
  /**
   * Indicates if the value of the field should be hidden.
   * When true, the field value is masked.
   * When false, children components are displayed for user interaction.
   */
  shouldHideField: boolean | undefined;

  /**
   * Callback function triggered when the replace button is clicked.
   * It is used to reset the field value to null or empty.
   */
  onClear: () => void;

  /**
   * The components to be displayed when the field value is not hidden,
   * typically used for user interaction to input or edit the value.
   */
  children: ReactElement<ChildProps>;

  field: CredentialInputField;

  requiredFields: string[];

  /**
   * Optional text displayed in input field when the field value is hidden
   */
  placeholder?: string;

  /**
   * Optional text that provides additional information or instructions
   * for the field, displayed alongside the label.
   */
  labelHelp?: string;

  /**
   * The text label displayed above the field to indicate what
   * information the field contains or expects.
   */
  label?: string;
}

export const EncryptedInputButtons = ({
  onClear,
  isDisabled = true,
}: EncryptedInputButtonsProps) => (
  <div style={{ display: 'flex', gap: '0.0rem' }}>
    <Button isDisabled={isDisabled} variant={'control'} onClick={() => onClear()}>
      <Icon>
        <KeyIcon />
      </Icon>
    </Button>
    <Button variant={'control'} onClick={() => onClear()}>
      <Icon>
        <RedoIcon />
      </Icon>
    </Button>
  </div>
);
export function SingleLineEncryptedInput({
  onClear,
  field,
  shouldHideField,
  children,
  requiredFields,
  placeholder,
}: IProps) {
  const { t } = useTranslation();

  if (shouldHideField) {
    return (
      <InputGroup>
        <CredentialTextInput
          key={field.id}
          field={field}
          isDisabled={shouldHideField}
          isRequired={requiredFields.includes(field.id)}
          placeholder={placeholder ? placeholder : t('ENCRYPTED')}
          buttons={
            <Button variant="control" onClick={() => onClear()}>
              <Icon>
                <RedoIcon />
              </Icon>
            </Button>
          }
          handleModalToggle={function (): void {
            throw new Error('Function not implemented.');
          }}
          accumulatedPluginValues={[]}
        />
      </InputGroup>
    );
  }
  return <>{children}</>;
}

export function MultiLineEncryptedInput({
  onClear,
  shouldHideField,
  label,
  children,
  placeholder,
}: IProps) {
  const { t } = useTranslation();
  if (shouldHideField) {
    return (
      <InputGroup>
        <PageFormFileUpload
          label={label}
          name={''}
          isDisabled={shouldHideField}
          textAreaPlaceholder={placeholder ? placeholder : t('ENCRYPTED')}
          type="text"
          autoComplete="off"
          icon={<EncryptedInputButtons onClear={onClear} isDisabled={true} />}
        />
      </InputGroup>
    );
  }
  return <>{children}</>;
}
