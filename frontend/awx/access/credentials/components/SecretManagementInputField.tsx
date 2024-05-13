import { Button, Icon, InputGroup, TextInput, Tooltip } from '@patternfly/react-core';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { PageFormGroup } from '../../../../../framework/PageForm/Inputs/PageFormGroup';
import { EyeSlashIcon, KeyIcon, RedoIcon } from '@patternfly/react-icons';
import { PageFormTextInput } from '../../../../../framework';

interface ChildProps {
  labelHelp?: string;
  label?: string;
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

export function SecretManagementInputField({
  onClear,
  shouldHideField,
  label,
  labelHelp,
  children,
  placeholder,
}: IProps) {
  const { t } = useTranslation();
  const fieldLabel = label || children.props.label || '';
  const fieldLabelHelp = labelHelp || children.props.labelHelp || '';
  if (shouldHideField) {
    return (
      <PageFormGroup label={fieldLabel} labelHelp={fieldLabelHelp}>
        <InputGroup>
          <PageFormTextInput
            aria-label={t('hidden value')}
            placeholder={placeholder ? placeholder : t('ENCRYPTED')}
            type="password"
            autoComplete="off"
            isDisabled={true}
            name={''}
            button={
              <>
                <Button isDisabled={true} variant="control" onClick={() => onClear()}>
                  <Icon>
                    <KeyIcon />
                  </Icon>
                </Button>
                <Button variant="control" onClick={() => onClear()}>
                  <Icon>
                    <RedoIcon />
                  </Icon>
                </Button>
              </>
            }
          />
        </InputGroup>
      </PageFormGroup>
    );
  }
  return <>{children}</>;
}
