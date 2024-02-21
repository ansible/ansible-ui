import { Button, Flex, FlexItem, ToggleGroup, ToggleGroupItem } from '@patternfly/react-core';
import { CopyIcon, DownloadIcon, UploadIcon } from '@patternfly/react-icons';
import jsyaml from 'js-yaml';
import { ReactNode, useCallback, useState } from 'react';
import {
  Controller,
  FieldPathByValue,
  FieldValues,
  Validate,
  useFormContext,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { usePageAlertToaster } from '../..';
import { DataEditor, DataEditorLanguages } from '../../components/DataEditor';
import { DropZone } from '../../components/DropZone';
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
  additionalControls?: ReactNode;

  valueFormat?: DataEditorLanguages | 'object';

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
    valueFormat,
    disableCopy,
    disableUpload,
    disableDownload,
    disableExpand,
    validate,
  } = props;
  const id = useID(props);
  const {
    formState: { isSubmitting, isValidating, errors },
    setError,
    getValues,
    control,
  } = useFormContext<TFieldValues>();
  const defaultLanguage = 'yaml';
  const [language, setLanguage] = useState<DataEditorLanguages>(defaultLanguage); // TODO settings.defaultCodeLanguage
  const [isExpanded, setExpanded] = useState(!props.defaultCollapsed);

  // Here we store the value the data editor is working with
  const [dataEditorValue, setDataEditorValue] = useState(() =>
    valueToString(getValues(name), defaultLanguage)
  );

  const alertToaster = usePageAlertToaster();
  const { writeToClipboard } = useClipboard();

  const handleCopy = useCallback(
    () => writeToClipboard(valueToString(getValues(name), language)),
    [getValues, language, name, writeToClipboard]
  );

  const handleUpload = useCallback(() => {
    // if (fileInputRef.current) {
    //   fileInputRef.current.click();
    // setDataEditorValue
    // }
  }, []);

  const handleDownload = useCallback(() => {
    const fileName = name || 'codeEditorData';
    downloadTextFile(fileName, valueToString(getValues(name), language));
    alertToaster.addAlert({ variant: 'success', title: t('File downloaded') });
  }, [alertToaster, getValues, language, name, t]);

  const required = useRequiredValidationRule(props.label, props.isRequired);

  return (
    <Controller<TFieldValues, TFieldName>
      name={name}
      control={control}
      shouldUnregister
      render={({ field: { name, onChange, value }, fieldState: { error } }) => {
        function handleChange(stringValue: string) {
          onChange(valueToLanguage(stringValue, language));
        }
        return (
          <PageFormGroup
            fieldId={id}
            icon={
              !disableExpand && <ExpandIcon isExpanded={isExpanded} setExpanded={setExpanded} />
            }
            label={props.label}
            labelHelpTitle={props.labelHelpTitle}
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
            helperTextInvalid={!(validate && isValidating) && error?.message?.split('\n')}
            isRequired={props.isRequired}
          >
            {isExpanded && (
              <DropZone onLoad={handleChange} isDisabled={isSubmitting || props.isReadOnly}>
                <DataEditor
                  data-cy={id}
                  id={id}
                  name={name}
                  language={language}
                  value={dataEditorValue}
                  onChange={handleChange}
                  setError={(error) => setError(name, { message: error })}
                  isReadOnly={props.isReadOnly || isSubmitting}
                  className="pf-v5-c-form-control"
                />
              </DropZone>
            )}
          </PageFormGroup>
        );
      }}
      rules={{ required, validate: props.validate }}
    />
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
  const hasButtons = !!handleCopy || !!handleDownload || !!handleUpload;
  return (
    <Flex>
      <FlexItem>{props.children}</FlexItem>
      {hasButtons && (
        <FlexItem>
          {handleCopy && (
            <Button
              id="copy-button"
              data-cy="copy-button"
              aria-label={t('Copy to clipboard')}
              icon={<CopyIcon />}
              type="button"
              onClick={handleCopy}
              variant="plain"
              size="sm"
              style={{ minWidth: 0, padding: 0, paddingLeft: 8, paddingRight: 8 }}
            />
          )}
          {handleUpload && (
            <Button
              id="upload-button"
              data-cy="upload-button"
              aria-label={t('Upload from file')}
              icon={<UploadIcon />}
              type="button"
              onClick={handleUpload}
              variant="plain"
              size="sm"
              style={{ minWidth: 0, padding: 0, paddingLeft: 8, paddingRight: 8 }}
            />
          )}
          {handleDownload && (
            <Button
              id="download-button"
              data-cy="download-button"
              aria-label={t('Download file')}
              icon={<DownloadIcon />}
              type="button"
              onClick={handleDownload}
              variant="plain"
              size="sm"
              style={{ minWidth: 0, padding: 0, paddingLeft: 8, paddingRight: 8 }}
            />
          )}
        </FlexItem>
      )}
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

function valueToString(value: undefined | null | string | object, language: DataEditorLanguages) {
  switch (typeof value) {
    case 'string':
      return value;
    case 'object':
      if (value === null) return '';
      try {
        switch (language) {
          case 'json':
            return JSON.stringify(value, null, 2);
          case 'yaml':
            return jsyaml.dump(value);
        }
      } catch {
        // do nothing
      }
  }
  return '';
}

function valueToLanguage(value: string, language: DataEditorLanguages | 'object') {
  switch (language) {
    case 'json':
      return JSON.parse(value);
    case 'yaml':
      return jsyaml.load(value);
  }
}
