import { Button } from '@patternfly/react-core';
import { KeyIcon } from '@patternfly/react-icons';
import { PageFormFileUpload } from '../../../../../framework/PageForm/Inputs/PageFormFileUpload';
import { CredentialInputField, CredentialType } from '../../../interfaces/CredentialType';
import { useTranslation } from 'react-i18next';
import { Credential } from '../../../interfaces/Credential';
import { useGetItem } from '../../../../common/crud/useGet';
import { awxAPI } from '../../../common/api/awx-utils';
import { CredentialPluginsInputSource } from '../CredentialPlugins/hooks/useCredentialPluginsDialog';
import { useCallback, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

export function CredentialMultilineInput({
  field,
  requiredFields,
  kind,
  handleModalToggle,
  accumulatedPluginValues,
}: {
  field: CredentialInputField;
  requiredFields: CredentialType['inputs']['required'];
  kind: CredentialType['kind'];
  handleModalToggle: () => void;
  accumulatedPluginValues: CredentialPluginsInputSource[];
}) {
  const { t } = useTranslation();
  const { setValue } = useFormContext();
  const useGetSourceCredential = (id: number) => {
    const { data } = useGetItem<Credential>(awxAPI`/credentials/`, id);
    return data;
  };
  const sourceCredential = useGetSourceCredential(
    accumulatedPluginValues.filter((cp) => cp.input_field_name === field.id)[0]?.source_credential
  );

  const handleIsDisabled = (field: CredentialInputField): boolean => {
    let isDisabled = false;
    accumulatedPluginValues.forEach((cp) => {
      if (cp.input_field_name === field.id) {
        isDisabled = true;
      }
    });
    return isDisabled;
  };

  const handleHelperText = (field: CredentialInputField): string => {
    let helperText = '';
    accumulatedPluginValues.forEach((cp) => {
      if (cp.input_field_name === field.id) {
        helperText = t(
          'This field will be retrieved from an external secret management system using the specified credential.'
        );
      }
    });
    return helperText;
  };

  const renderFieldValue = useCallback(
    (field: CredentialInputField): string => {
      let placeholder = 'Drag a file here or browse to upload';
      accumulatedPluginValues.forEach((cp) => {
        if (cp.input_field_name === field.id && sourceCredential) {
          placeholder = t(`Value is managed by ${sourceCredential.kind}: ${sourceCredential.name}`);
        }
      });
      return placeholder;
    },
    [accumulatedPluginValues, sourceCredential, t]
  );

  useEffect(() => {
    // if field id matches accumulatedPluginValues input_field_name, set value to kind: credential name
    if (accumulatedPluginValues.some((cp) => cp.input_field_name === field.id)) {
      setValue(field.id, renderFieldValue(field), { shouldDirty: true });
    }
  }, [setValue, accumulatedPluginValues, renderFieldValue, field]);

  return (
    <>
      <PageFormFileUpload
        key={field.id}
        type="text"
        label={field.label}
        name={`${field.id}`}
        labelHelpTitle={field.label}
        labelHelp={field.help_text}
        helperText={handleHelperText(field)}
        isRequired={requiredFields.includes(field.id)}
        isReadOnly={handleIsDisabled(field)}
        allowEditingUploadedText={true}
        icon={
          kind !== 'external' ? (
            <Button icon={<KeyIcon />} variant="control" onClick={handleModalToggle} />
          ) : undefined
        }
      />
    </>
  );
}
