import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { Controller, FieldPathByValue, FieldValues, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  DataEditorActions,
  objectToString,
  PageFormDataEditorInputProps,
  usePageAlertToaster,
  usePageSettings,
  valueToObject,
} from '../../../framework';
import { useID } from '../../../framework/hooks/useID';
import { DataEditor, DataEditorLanguages } from '../../../framework/components/DataEditor';
import { useClipboard } from '../../../framework/hooks/useClipboard';
import { downloadTextFile } from '../../../framework/utils/download-file';
import { useRequiredValidationRule } from '../../../framework/PageForm/Inputs/validation-hooks';
import { PageFormGroup } from '../../../framework/PageForm/Inputs/PageFormGroup';
import { ExpandIcon } from '../../../framework/components/icons/ExpandIcon';
import { DropZone } from '../../../framework/components/DropZone';

export function EdaPageFormDataEditor<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPathByValue<
    TFieldValues,
    object | string | undefined | null
  > = FieldPathByValue<TFieldValues, object | string | undefined | null>,
>(props: PageFormDataEditorInputProps<TFieldValues, TFieldName>) {
  const { t } = useTranslation();
  const {
    name,
    format: valueFormat,
    disableCopy,
    disableUpload,
    disableDownload,
    disableExpand,
    validate,
    isArray,
  } = props;
  const id = useID(props);
  const {
    formState: { isSubmitting, isValidating },
    setError,
    getValues,
    clearErrors,
    control,
  } = useFormContext<TFieldValues>();
  const settings = usePageSettings();
  const defaultLanguage = settings.dataEditorFormat ?? 'yaml';
  const [language, setLanguage] = useState<DataEditorLanguages>(defaultLanguage); // TODO settings.defaultCodeLanguage
  const [isExpanded, setExpanded] = useState(!props.defaultCollapsed);

  // Here we store the value the data editor is working with
  const [dataEditorValue, setDataEditorValue] = useState<string>(() => {
    const value = getValues(name);
    if (typeof value === 'string') return value as string;
    else return objectToString(value, defaultLanguage);
  });

  const alertToaster = usePageAlertToaster();
  const { writeToClipboard } = useClipboard();

  const handleCopy = useCallback(
    () => writeToClipboard(objectToString(valueToObject(getValues(name), isArray), language)),
    [getValues, isArray, language, name, writeToClipboard]
  );

  const onDrop = useCallback(
    (contents: string) => {
      setDataEditorValue(objectToString(valueToObject(contents, isArray), language));
    },
    [isArray, language]
  );

  const dropZoneInputRef = useRef<HTMLInputElement>(null);
  const handleUpload = useCallback(() => dropZoneInputRef.current?.click(), []);

  const handleDownload = useCallback(() => {
    const fileName = name || 'data';
    const extension = language === 'json' ? 'json' : 'yaml';
    downloadTextFile(
      fileName,
      objectToString(valueToObject(getValues(name), isArray), language),
      extension
    );
    alertToaster.addAlert({ variant: 'success', title: t('File downloaded'), timeout: true });
  }, [alertToaster, getValues, isArray, language, name, t]);

  const value = getValues(name);
  useLayoutEffect(() => {
    setDataEditorValue(objectToString(valueToObject(value, isArray), language));
  }, [value, getValues, isArray, language, name]);

  const required = useRequiredValidationRule(props.label, props.isRequired);

  return (
    <Controller<TFieldValues, TFieldName>
      name={name}
      control={control}
      shouldUnregister
      render={({ field: { name, onChange }, fieldState: { error } }) => {
        function handleChange(stringValue: string) {
          switch (valueFormat) {
            case 'object':
              onChange(valueToObject(stringValue, isArray));
              return;
            default:
              onChange(objectToString(valueToObject(stringValue, isArray), valueFormat));
              break;
          }
        }
        return (
          <PageFormGroup
            fieldId={id}
            icon={
              !disableExpand && <ExpandIcon isExpanded={isExpanded} setExpanded={setExpanded} />
            }
            label={props.label}
            labelHelpTitle={props.labelHelpTitle ?? props.label}
            labelHelp={props.labelHelp}
            additionalControls={
              <DataEditorActions
                handleCopy={!disableCopy && handleCopy}
                handleUpload={!disableUpload && handleUpload}
                handleDownload={!disableDownload && handleDownload}
                language={language}
                setLanguage={setLanguage}
              >
                {props.additionalControls}
              </DataEditorActions>
            }
            helperText={props.helperText}
            helperTextInvalid={!(validate && isValidating) && error?.message?.split('\n')}
            isRequired={props.isRequired}
          >
            {isExpanded && (
              <DropZone
                onDrop={onDrop}
                isDisabled={isSubmitting || props.isReadOnly}
                inputRef={dropZoneInputRef}
              >
                <DataEditor
                  data-cy={id}
                  id={id}
                  name={name}
                  language={language}
                  value={dataEditorValue}
                  onChange={handleChange}
                  setError={(error) => {
                    if (!error) clearErrors(name);
                    else setError(name, { message: error });
                  }}
                  isReadOnly={props.isReadOnly || isSubmitting}
                  className={
                    props.isReadOnly ? `pf-v5-c-form-control pf-m-disabled` : `pf-v5-c-form-control`
                  }
                />
              </DropZone>
            )}
            {!isExpanded && <div className="pf-v5-c-form-control" />}
          </PageFormGroup>
        );
      }}
      rules={{ required, validate: props.validate }}
    />
  );
}
