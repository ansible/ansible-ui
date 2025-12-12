import { Flex, FlexItem, Icon, ToggleGroup, ToggleGroupItem } from '@patternfly/react-core';
import { CopyIcon, DownloadIcon, UploadIcon } from '@patternfly/react-icons';
import isDeepEqual from 'fast-deep-equal';
import getValue from 'get-value';
import jsyaml, { YAMLException } from 'js-yaml';
import { ReactNode, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { parseJSONPreservingLargeInts, stringifyPreservingLargeInts } from '../../utils/jsonUtils';
import { safeDump, safeLoad } from '../../utils/yamlSchema';
import {
  Controller,
  FieldPath,
  FieldPathByValue,
  FieldValues,
  PathValue,
  Validate,
  useFormContext,
  useWatch,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  PageActionSelection,
  PageActionType,
  PageActions,
  usePageAlertToaster,
  usePageSettings,
} from '../..';
import { DataEditor, DataEditorLanguages } from '../../components/DataEditor';
import { DropZone } from '../../components/DropZone';
import { IconButton } from '../../components/IconButton';
import { ExpandIcon } from '../../components/icons/ExpandIcon';
import { useClipboard } from '../../hooks/useClipboard';
import { useID } from '../../hooks/useID';
import { downloadTextFile } from '../../utils/download-file';
import { PageFormGroup } from './PageFormGroup';
import { useRequiredValidationRule } from './validation-hooks';

export type PageFormDataEditorInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPathByValue<
    TFieldValues,
    object | string | undefined | null
  > = FieldPathByValue<TFieldValues, object | string | undefined | null>,
> = {
  // Standard form group props
  id?: string;
  name: TFieldName;
  label: string;
  labelHelp?: string | string[] | ReactNode;
  labelHelpTitle?: string;
  helperText?: string | undefined;
  additionalControls?: ReactNode;

  format: DataEditorLanguages | 'object';

  // Features - Enable all by default and only turn them off if needed
  disableCopy?: boolean;
  disableUpload?: boolean;
  disableDownload?: boolean;
  disableExpand?: boolean;

  /** If the editor is expandable, it will be collapsed by default. */
  defaultCollapsed?: boolean;

  // Validation
  isRequired?: boolean;
  validate?: Validate<string, TFieldValues> | Record<string, Validate<string, TFieldValues>>;

  /** Indicates that the field is read-only. */
  isReadOnly?: boolean;

  /** Defaults empty value to array for json */
  isArray?: boolean;

  defaultValue?: string | object;

  enableUndo?: boolean;
  enableReset?: boolean;
};

export function PageFormDataEditor<
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

  const [originalYamlWithComments, setOriginalYamlWithComments] = useState<string | null>(null);

  const getDisplayValue = useCallback(
    (formValue: string | object, targetLanguage: DataEditorLanguages): string => {
      if (originalYamlWithComments) {
        if (targetLanguage === 'yaml') {
          return originalYamlWithComments;
        } else if (targetLanguage === 'json') {
          try {
            return objectToString(valueToObject(originalYamlWithComments, isArray), 'json');
          } catch {
            return objectToString(valueToObject(formValue, isArray), targetLanguage);
          }
        }
      }

      return objectToString(valueToObject(formValue, isArray), targetLanguage);
    },
    [originalYamlWithComments, isArray]
  );

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

  useLayoutEffect(() => {
    const formValue = getValues(name);

    if (typeof formValue === 'string' && hasYamlComments(formValue) && !originalYamlWithComments) {
      setOriginalYamlWithComments(formValue);
    }

    const value = getDisplayValue(formValue, language);
    setDataEditorValue(value);
  }, [getValues, isArray, language, name, getDisplayValue, originalYamlWithComments]);

  const [hasFocus, setHasFocus] = useState(false);

  const watchValue = useWatch({ name });
  useEffect(() => {
    if (hasFocus) return;

    if (
      typeof watchValue === 'string' &&
      hasYamlComments(watchValue) &&
      !originalYamlWithComments
    ) {
      setOriginalYamlWithComments(watchValue);
    }

    const value = getDisplayValue(watchValue, language);
    setDataEditorValue(value);
  }, [hasFocus, watchValue, isArray, language, getDisplayValue, originalYamlWithComments]);

  const {
    setValue,
    formState: { defaultValues },
  } = useFormContext<TFieldValues>();

  const required = useRequiredValidationRule(props.label, props.isRequired);

  const undoValue = getValue(defaultValues as object, props.name) as PathValue<
    TFieldValues,
    TFieldName
  >;

  return (
    <Controller<TFieldValues, TFieldName>
      name={name}
      control={control}
      shouldUnregister
      render={({ field: { value, name, onChange }, fieldState: { error } }) => {
        function handleChange(stringValue: string) {
          try {
            const valueAsObject = valueToObject(stringValue, isArray);

            if (language === 'yaml' && hasYamlComments(stringValue)) {
              setOriginalYamlWithComments(stringValue);
            }

            switch (valueFormat) {
              case 'object':
                if (
                  typeof valueAsObject === 'object' &&
                  valueAsObject !== null &&
                  '__preserveYamlString' in valueAsObject
                ) {
                  const preservedObj = valueAsObject as { __preserveYamlString: string };
                  const actualObject = jsyaml.load(preservedObj.__preserveYamlString) as object;
                  onChange(actualObject);
                  return;
                }
                onChange(valueAsObject);
                return;
              case 'yaml':
                if (
                  typeof valueAsObject === 'object' &&
                  valueAsObject !== null &&
                  '__preserveYamlString' in valueAsObject
                ) {
                  const preservedObj = valueAsObject as { __preserveYamlString: string };
                  onChange(preservedObj.__preserveYamlString);
                  return;
                }
                onChange(objectToString(valueAsObject, valueFormat));
                break;
              default:
                onChange(objectToString(valueAsObject, valueFormat));
                break;
            }

            clearErrors(name);
          } catch (err) {
            if (err instanceof Error) {
              setError(name, { message: err.message });
            }
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
              <div style={{ display: 'flex' }}>
                <DropZone
                  onDrop={onDrop}
                  isDisabled={isSubmitting || props.isReadOnly}
                  inputRef={dropZoneInputRef}
                >
                  <DataEditor
                    data-cy={id}
                    data-testid={id}
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
                      props.isReadOnly
                        ? `pf-v6-c-form-control pf-m-disabled`
                        : `pf-v6-c-form-control`
                    }
                    onFocus={() => setHasFocus(true)}
                    onBlur={() => setHasFocus(false)}
                  />
                </DropZone>
                <PageActions
                  actions={[
                    {
                      label: t('Undo changes'),
                      type: PageActionType.Button,
                      selection: PageActionSelection.None,
                      onClick: () => {
                        setValue(
                          props.name,
                          undoValue as unknown as PathValue<TFieldValues, TFieldName>
                        );
                        setDataEditorValue('');
                        setTimeout(() => {
                          setDataEditorValue(
                            objectToString(valueToObject(undoValue, isArray), language)
                          );
                        }, 0);
                      },
                      isHidden: () => !props.enableUndo || isDeepEqual(value, undoValue),
                    },
                    {
                      label: t('Reset to default'),
                      type: PageActionType.Button,
                      selection: PageActionSelection.None,
                      onClick: () => {
                        setValue(
                          props.name as FieldPath<TFieldValues>,
                          props.defaultValue as unknown as PathValue<
                            TFieldValues,
                            FieldPath<TFieldValues>
                          >
                        );
                        setDataEditorValue('');
                        setTimeout(() => {
                          setDataEditorValue(
                            objectToString(valueToObject(props.defaultValue, isArray), language)
                          );
                        }, 0);
                      },
                      isHidden: () => !props.enableReset || isDeepEqual(value, props.defaultValue),
                    },
                  ]}
                  // variant={ButtonVariant.control}
                  position={'right'}
                />
              </div>
            )}
            {!isExpanded && <div className="pf-v6-c-form-control" />}
          </PageFormGroup>
        );
      }}
      rules={{ required, validate: props.validate }}
    />
  );
}

export function DataEditorButtons(props: {
  handleCopy: (() => void) | false;
  handleDownload: (() => void) | false;
  handleUpload: (() => void) | false;
  children?: ReactNode;
}) {
  const { t } = useTranslation();
  const { handleCopy, handleDownload, handleUpload } = props;
  if (!handleCopy && !handleDownload && !handleUpload) return <></>;
  return (
    <Flex spaceItems={{ default: 'spaceItemsMd' }}>
      {handleCopy && (
        <FlexItem>
          <IconButton
            id="copy-button"
            data-cy="copy-button"
            data-testid="copy-button"
            aria-label={t('Copy to clipboard')}
            type="button"
            onClick={handleCopy}
          >
            <Icon size="md">
              <CopyIcon />
            </Icon>
          </IconButton>
        </FlexItem>
      )}
      {handleUpload && (
        <FlexItem>
          <IconButton
            id="upload-button"
            data-cy="upload-button"
            data-testid="upload-button"
            aria-label={t('Upload from file')}
            type="button"
            onClick={handleUpload}
          >
            <Icon size="md">
              <UploadIcon />
            </Icon>
          </IconButton>
        </FlexItem>
      )}
      {handleDownload && (
        <FlexItem>
          <IconButton
            id="download-button"
            data-cy="download-button"
            data-testid="download-button"
            aria-label={t('Download file')}
            type="button"
            onClick={handleDownload}
          >
            <Icon size="md">
              <DownloadIcon />
            </Icon>
          </IconButton>
        </FlexItem>
      )}
    </Flex>
  );
}

export function DataEditorActions(props: {
  handleCopy: (() => void) | false;
  handleDownload: (() => void) | false;
  handleUpload: (() => void) | false;
  language: string;
  setLanguage: (language: DataEditorLanguages) => void;
  children?: ReactNode;
}) {
  const { t } = useTranslation();
  const { handleCopy, handleDownload, handleUpload, language, setLanguage } = props;
  return (
    <Flex spaceItems={{ default: 'spaceItemsLg' }}>
      <FlexItem>{props.children}</FlexItem>
      <DataEditorButtons
        handleCopy={handleCopy}
        handleDownload={handleDownload}
        handleUpload={handleUpload}
      />
      <FlexItem align={{ default: 'alignRight' }}>
        <ToggleGroup isCompact>
          <ToggleGroupItem
            id="toggle-yaml"
            data-cy="toggle-yaml"
            data-testid="toggle-yaml"
            aria-label={t('Toggle to YAML')}
            isSelected={language === 'yaml'}
            text="YAML"
            type="button"
            onChange={() => setLanguage('yaml')}
          />
          <ToggleGroupItem
            id="toggle-json"
            data-cy="toggle-json"
            data-testid="toggle-json"
            aria-label={t('Toggle to JSON')}
            isSelected={language === 'json'}
            text="JSON"
            type="button"
            onChange={() => setLanguage('json')}
          />
        </ToggleGroup>
      </FlexItem>
    </Flex>
  );
}

function hasYamlComments(yamlString: string): boolean {
  const lines = yamlString.split('\n');
  return lines.some((line) => {
    const trimmed = line.trim();
    return (
      trimmed.startsWith('#') ||
      (trimmed.includes('#') && !/^[^#]*["'][^"']*#[^"']*["'][^#]*$/.exec(trimmed))
    );
  });
}

export function valueToObject(
  value: string | object | undefined | null,
  isArray?: boolean
): object {
  const emptyArrayOrObject = isArray ? [] : {};
  const emptyValue = value === undefined || value === null;

  if (emptyValue) {
    return emptyArrayOrObject;
  }

  const catchError = () => {
    try {
      value = safeLoad(value as string) as object;
    } catch (err) {
      if (err instanceof Error || err instanceof YAMLException) {
        return new Error(err.message);
      }
      return {};
    }
  };

  if (typeof value === 'string') {
    if (hasYamlComments(value)) {
      try {
        safeLoad(value);
        return { __preserveYamlString: value } as object;
      } catch {
        // If invalid YAML, fall through to normal processing
      }
    }
    try {
      value = parseJSONPreservingLargeInts(value) as object;
    } catch {
      catchError();
    }
  }

  if (isArray) {
    if (Array.isArray(value)) {
      return value as object;
    } else {
      return [];
    }
  } else {
    if (Array.isArray(value)) {
      return {};
    } else {
      return value as object;
    }
  }
}

export function objectToString(obj: object, language: DataEditorLanguages): string {
  if (obj === null || obj === undefined) {
    return '';
  }

  if (obj instanceof Error) {
    return obj.message;
  }

  if (typeof obj === 'object' && obj !== null && '__preserveYamlString' in obj) {
    const preservedObj = obj as { __preserveYamlString: string };
    if (language === 'yaml') {
      return preservedObj.__preserveYamlString;
    } else {
      try {
        const parsedYaml = safeLoad(preservedObj.__preserveYamlString);
        return stringifyPreservingLargeInts(parsedYaml, 2);
      } catch {
        return preservedObj.__preserveYamlString; // Fallback to original
      }
    }
  }

  switch (language) {
    case 'json':
      return stringifyPreservingLargeInts(obj, 2);
    case 'yaml': {
      try {
        const yaml = safeDump(obj).trimEnd();
        switch (yaml) {
          case 'null':
          case '{}':
          case '[]':
            return '';
          default:
            return yaml;
        }
      } catch (err) {
        if (err instanceof Error || err instanceof YAMLException) {
          return err.message;
        }
        return '';
      }
    }
    default:
      return '';
  }
}
