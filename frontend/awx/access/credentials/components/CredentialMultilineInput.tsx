import { Button, Tooltip } from '@patternfly/react-core';
import { KeyIcon, UndoIcon } from '@patternfly/react-icons';
import { PageFormFileUpload } from '../../../../../framework/PageForm/Inputs/PageFormFileUpload';
import { CredentialInputField, CredentialType } from '../../../interfaces/CredentialType';
import { useTranslation } from 'react-i18next';
import { Credential } from '../../../interfaces/Credential';
import { useGetItem } from '../../../../common/crud/useGet';
import { awxAPI } from '../../../common/api/awx-utils';
import { CredentialPluginsInputSource } from '../CredentialPlugins/hooks/useCredentialPluginsDialog';
import { useCallback, useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { initialValues } from '../CredentialForm';

export function CredentialMultilineInput({
  field,
  requiredFields,
  kind,
  handleModalToggle,
  accumulatedPluginValues,
  setAccumulatedPluginValues,
  setPluginsToDelete,
  initialValues,
}: {
  field: CredentialInputField;
  requiredFields: CredentialType['inputs']['required'];
  kind: CredentialType['kind'];
  handleModalToggle: () => void;
  accumulatedPluginValues: CredentialPluginsInputSource[];
  setAccumulatedPluginValues?: (values: CredentialPluginsInputSource[]) => void;
  setPluginsToDelete?: React.Dispatch<React.SetStateAction<string[]>>;
  initialValues?: initialValues;
}) {
  const { t } = useTranslation();
  const [shouldHideField, setShouldHideField] = useState(field.secret);
  const { getValues, setValue, clearErrors } = useFormContext();
  const watchedFieldValue = getValues();
  const onClear = () => {
    setValue(field.id, '', { shouldDirty: false });
    clearErrors(field.id);
    if (accumulatedPluginValues.some((cp) => cp.input_field_name === field.id)) {
      setPluginsToDelete?.((prev: string[]) => [...prev, field.id]);
    }
    setAccumulatedPluginValues?.(
      accumulatedPluginValues.filter((cp) => cp.input_field_name !== field.id)
    );
  };
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

  const clearField = () => {
    setValue(field.id, '', { shouldDirty: false });
    setShouldHideField(!shouldHideField);
  };
  const hideField = () => {
    setValue(field.id, initialValues?.[field.id], { shouldDirty: true });
    setShouldHideField(!shouldHideField);
    setAccumulatedPluginValues?.(
      accumulatedPluginValues.filter((cp) => cp.input_field_name !== field.id)
    );
  };

  return (
    <>
      <PageFormFileUpload
        onClearClick={onClear}
        key={field.id}
        type="text"
        label={field.label}
        name={`${field.id}`}
        labelHelpTitle={field.label}
        labelHelp={field.help_text}
        helperText={handleHelperText(field)}
        isRequired={requiredFields.includes(field.id)}
        isReadOnly={handleIsDisabled(field)}
        isDisabled={watchedFieldValue?.[field.id] === '$encrypted$'}
        isClearButtonDisabled={
          watchedFieldValue?.[field.id] === '$encrypted$' || !watchedFieldValue?.[field.id]
        }
        allowEditingUploadedText={true}
        icon={
          kind !== 'external' ? (
            field.secret && watchedFieldValue?.[field.id] === '$encrypted$' ? (
              <div style={{ display: 'grid' }}>
                <Button
                  icon={<KeyIcon />}
                  variant="control"
                  onClick={handleModalToggle}
                  isDisabled
                />
                <Tooltip content={t('Replace')}>
                  <Button icon={<UndoIcon />} variant="control" onClick={clearField} />
                </Tooltip>
              </div>
            ) : field.secret &&
              initialValues?.[field.id] &&
              initialValues?.[field.id] === '$encrypted$' &&
              watchedFieldValue?.[field.id] !== '$encrypted$' ? (
              <div style={{ display: 'grid' }}>
                <Button icon={<KeyIcon />} variant="control" onClick={handleModalToggle} />
                <Tooltip content={t('Revert')}>
                  <Button icon={<UndoIcon />} variant="control" onClick={hideField} />
                </Tooltip>
              </div>
            ) : (
              <Button icon={<KeyIcon />} variant="control" onClick={handleModalToggle} />
            )
          ) : undefined
        }
      />
    </>
  );
}
