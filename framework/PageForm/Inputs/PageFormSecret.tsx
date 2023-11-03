import { Button, InputGroup, TextInput } from '@patternfly/react-core';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { PageFormGroup } from './PageFormGroup';

interface ChildProps {
  labelHelp?: string;
  label?: string;
}

/**
 * Props for the PageFormSecret component.
 * @interface IProps
 */
interface IProps {
  /**
   * Indicates if the value of the field should be hidden.
   * When true, the field value is masked and a clear button is displayed.
   * When false, children components are displayed for user interaction.
   */
  shouldHideField: boolean | undefined;

  /**
   * Callback function triggered when the clear button is clicked.
   * It is used to reset the field value to null or empty.
   */
  onClear: () => void;

  /**
   * The components to be displayed when the field value is not hidden,
   * typically used for user interaction to input or edit the value.
   */
  children: ReactElement<ChildProps>;

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

export function PageFormSecret({ onClear, shouldHideField, label, labelHelp, children }: IProps) {
  const { t } = useTranslation();
  const fieldLabel = label || children.props.label || '';
  const fieldLabelHelp = labelHelp || children.props.labelHelp || '';
  if (shouldHideField) {
    return (
      <PageFormGroup label={fieldLabel} labelHelp={fieldLabelHelp}>
        <InputGroup>
          <TextInput
            aria-label={t('hidden value')}
            placeholder="••••••••••••••••••••••"
            type="password"
            autoComplete="off"
            isDisabled={true}
          />
          <Button variant="control" onClick={() => onClear()}>
            {t(`Clear`)}
          </Button>
        </InputGroup>
      </PageFormGroup>
    );
  }
  return <>{children}</>;
}
