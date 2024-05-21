import { Button, Icon, InputGroup } from '@patternfly/react-core';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { RedoIcon } from '@patternfly/react-icons';
import { CredentialInputField } from '../../../interfaces/CredentialType';
import { CredentialTextInput } from '../CredentialForm';

interface ChildProps {
  labelHelp?: string;
  label?: string;
}

interface IProps {
  shouldHideField: boolean | undefined;
  onClear: () => void;
  children: ReactElement<ChildProps>;
  field: CredentialInputField;
  requiredFields: string[];
  placeholder?: string;
  labelHelp?: string;
  label?: string;
}

export function EncryptedTextFormInput({
  onClear,
  field,
  shouldHideField,
  children,
  requiredFields,
  //placeholder,
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
          placeholder={t('ENCRYPTED')}
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
