import { Flex, FlexItem, Icon, ToggleGroup, ToggleGroupItem } from '@patternfly/react-core';
import { CopyIcon, DownloadIcon, UploadIcon } from '@patternfly/react-icons';
import jsyaml from 'js-yaml';
import { ReactNode, useCallback, useLayoutEffect, useRef, useState } from 'react';
import {
  Controller,
  FieldPathByValue,
  FieldValues,
  Validate,
  useFormContext,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { usePageAlertToaster, usePageSettings } from '../..';
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
    const value = objectToString(valueToObject(getValues(name), isArray), language);
    setDataEditorValue(value);
  }, [getValues, isArray, language, name]);

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
            aria-label={t('Toggle to YAML')}
            isSelected={language === 'yaml'}
            text="YAML"
            type="button"
            onChange={() => setLanguage('yaml')}
          />
          <ToggleGroupItem
            id="toggle-json"
            data-cy="toggle-json"
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

export function valueToObject(
  value: string | object | undefined | null,
  isArray?: boolean
): object {
  if (value === undefined || value === null) {
    return isArray ? [] : {};
  }

  if (typeof value === 'string') {
    try {
      value = JSON.parse(value) as object;
    } catch {
      try {
        value = jsyaml.load(value as string) as object;
      } catch {
        return {};
      }
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
      return value;
    }
  }
}

function objectToString(obj: object, language: DataEditorLanguages): string {
  if (obj === null || obj === undefined) {
    return '';
  }
  try {
    switch (language) {
      case 'json':
        return JSON.stringify(obj, null, 2);
      case 'yaml': {
        const yaml = jsyaml.dump(obj).trimEnd();
        switch (yaml) {
          case 'null':
          case '{}':
          case '[]':
            return '';
          default:
            return yaml;
        }
      }
    }
  } catch {
    // do nothing
  }
  return '';
}
