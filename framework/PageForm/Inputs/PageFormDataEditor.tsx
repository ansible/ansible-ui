import {
  AlertProps,
  Button,
  Flex,
  FlexItem,
  ToggleGroupItem as PFToggleGroupItem,
  ToggleGroup,
  Tooltip,
} from '@patternfly/react-core';
import { AngleRightIcon, CopyIcon, DownloadIcon, UploadIcon } from '@patternfly/react-icons';
import jsyaml from 'js-yaml';
import { ReactNode, useCallback, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Controller,
  FieldErrors,
  FieldPathByValue,
  FieldValues,
  PathValue,
  Validate,
  useFormContext,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { usePageAlertToaster } from '../..';
import { useClipboard } from '../../hooks/useClipboard';
import { downloadTextFile } from '../../utils/download-file';
import { capitalizeFirstLetter } from '../../utils/strings';
import { DataEditor } from './DataEditor';
import { PageFormGroup } from './PageFormGroup';

const ToggleGroupItem = styled(PFToggleGroupItem)`
  &&:first-child#copy-button {
    margin-right: auto;
  }
`;

function ActionsRow(props: {
  handleCopy: () => void;
  handleDownload: () => void;
  handleUpload: () => void;
  allowCopy?: boolean;
  allowDownload?: boolean;
  allowUpload?: boolean;
  toggleLanguages?: string[];
  setLanguage: (language: string) => void;
  selectedLanguage: string;
  errors: FieldErrors<FieldValues>;
  name: string;
  children?: ReactNode;
}) {
  const { t } = useTranslation();
  const {
    handleCopy,
    handleDownload,
    handleUpload,
    allowCopy,
    allowDownload,
    allowUpload,
    toggleLanguages,
    setLanguage,
    selectedLanguage,
    errors,
    name,
  } = props;

  const actionItems: JSX.Element[] = [];

  if (allowCopy) {
    actionItems.push(
      <Tooltip key="copy-file" content={t('Copy')}>
        <Button
          key="copy-button"
          id="copy-button"
          data-cy="copy-button"
          aria-label={t('Copy to clipboard')}
          icon={<CopyIcon />}
          type="button"
          onClick={() => handleCopy()}
          variant="plain"
          size="sm"
          style={{ minWidth: 0, padding: 0, paddingLeft: 8, paddingRight: 8 }}
        />
      </Tooltip>
    );
  }

  if (allowUpload) {
    actionItems.push(
      <Tooltip key="upload-file" content={t('Upload')}>
        <Button
          key="upload-button"
          id="upload-button"
          data-cy="upload-button"
          aria-label={t('Upload from file')}
          icon={<UploadIcon />}
          type="button"
          onClick={() => handleUpload()}
          variant="plain"
          size="sm"
          style={{ minWidth: 0, padding: 0, paddingLeft: 8, paddingRight: 8 }}
        />
      </Tooltip>
    );
  }

  if (allowDownload) {
    actionItems.push(
      <Tooltip key="download-file" content={t('Download')}>
        <Button
          key="download-button"
          id="download-button"
          data-cy="download-button"
          aria-label={t('Download file')}
          icon={<DownloadIcon />}
          type="button"
          onClick={() => handleDownload()}
          variant="plain"
          size="sm"
          style={{ minWidth: 0, padding: 0, paddingLeft: 8, paddingRight: 8 }}
        />
      </Tooltip>
    );
  }

  const languageActions: JSX.Element[] =
    toggleLanguages?.map((language) => (
      <ToggleGroupItem
        key={language}
        id={`toggle-${language}`}
        data-cy={`toggle-${language}`}
        aria-label={t('Toggle to {{language}}', { language })}
        isSelected={selectedLanguage === language}
        isDisabled={Boolean(errors[name])}
        text={language}
        type="button"
        onChange={() => setLanguage(language)}
      />
    )) || [];

  return (
    <Flex
      grow={{ default: 'grow' }}
      columnGap={{ default: 'columnGapSm' }}
      rowGap={{ default: 'rowGapNone' }}
      justifyContent={{ default: 'justifyContentFlexEnd' }}
    >
      <FlexItem>{props.children}</FlexItem>
      <FlexItem>{actionItems}</FlexItem>
      <FlexItem align={{ default: 'alignRight' }}>
        <ToggleGroup isCompact>{languageActions}</ToggleGroup>
      </FlexItem>
    </Flex>
  );
}

export type PageFormDataEditorInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPathByValue<TFieldValues, undefined | string> = FieldPathByValue<
    TFieldValues,
    undefined | string
  >,
> = {
  name: TFieldName;
  validate?: Validate<string, TFieldValues> | Record<string, Validate<string, TFieldValues>>;
  language?: string;
  toggleLanguages?: string[];
  isExpandable?: boolean;
  allowUpload?: boolean;
  allowCopy?: boolean;
  allowDownload?: boolean;
  defaultExpanded?: boolean;

  id?: string;
  label?: string;
  isReadOnly?: boolean;
  isRequired?: boolean;

  additionalControls?: ReactNode;
  labelHelp?: string | string[] | ReactNode;
  labelHelpTitle?: string;

  disableLineNumbers?: boolean;
  isObject?: boolean;
};

export function PageFormDataEditor<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPathByValue<TFieldValues, undefined | string> = FieldPathByValue<
    TFieldValues,
    undefined | string
  >,
>(props: PageFormDataEditorInputProps<TFieldValues, TFieldName>) {
  const { t } = useTranslation();
  const {
    allowCopy = true,
    allowDownload = true,
    allowUpload = true,
    defaultExpanded,
    isExpandable,
    isReadOnly,
    isRequired,
    label,
    name,
    toggleLanguages,
    validate,
    disableLineNumbers,
    ...formGroupInputProps
  } = props;
  const {
    formState: { isSubmitting, isValidating, errors },
    setError: setFormError,
    clearErrors,
    getValues,
    control,
    setValue,
  } = useFormContext<TFieldValues>();

  const [language, setLanguage] = useState(props.language ?? 'yaml');
  const [isCollapsed, setCollapsed] = useState(!defaultExpanded);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const alertToaster = usePageAlertToaster();
  const { writeToClipboard } = useClipboard();
  const id = props.id ?? name.split('.').join('-');

  const handleCopy = useCallback(() => {
    writeToClipboard(getValues(name) as string);
  }, [getValues, name, writeToClipboard]);

  const handleUpload = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const handleDownload = useCallback(() => {
    const fileName = name || 'codeEditorData';
    downloadTextFile(fileName, getValues(name) as string);
    const alert: AlertProps = {
      variant: 'success',
      title: t('File downloaded'),
    };
    alertToaster.addAlert(alert);
  }, [alertToaster, getValues, name, t]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      reader.onload = () => {
        const contents = reader.result;
        if (typeof contents === 'string') {
          setValue(name, contents as PathValue<TFieldValues, TFieldName>);
          // Alert for a successful file upload
          const alert: AlertProps = {
            variant: 'success',
            title: t('File uploaded'),
          };
          alertToaster.addAlert(alert);
        }
      };
      reader.onerror = () => {
        // Alert for a failed file upload
        const alert: AlertProps = {
          variant: 'danger',
          title: t('Failed to upload file'),
          children: t('Unable to upload'),
        };
        alertToaster.addAlert(alert);
      };
      reader.readAsText(file);
    },
    [setValue, name, t, alertToaster]
  );

  const dropzone = useDropzone({
    onDrop,
    multiple: false,
  });

  return (
    <Controller<TFieldValues, TFieldName>
      name={name}
      control={control}
      shouldUnregister
      render={({ field: { name, onChange, value }, fieldState: { error } }) => {
        const errorSet = [...new Set(error?.message?.split('\n'))];
        const disabled = value !== undefined && value !== null && value !== '';

        function handleChange(value: string) {
          if (props.isObject) {
            try {
              onChange(JSON.parse(value));
            } catch (e) {
              try {
                onChange(jsyaml.load(value));
              } catch (e) {
                onChange(value);
              }
            }
          } else {
            onChange(value);
          }
        }

        return (
          <PageFormGroup
            fieldId={id}
            {...formGroupInputProps}
            icon={
              isExpandable ? (
                <AngleRightIcon
                  data-cy="expandable"
                  style={{
                    transform: isCollapsed ? 'rotate(0deg)' : 'rotate(90deg)',
                    transition: 'transform',
                  }}
                  onClick={() => setCollapsed((c) => !c)}
                  aria-label={t('Expand or collapse extra variables')}
                />
              ) : undefined
            }
            label={props.label}
            helperTextInvalid={!(validate && isValidating) && errorSet}
            additionalControls={
              isExpandable && isCollapsed ? (
                props.additionalControls
              ) : (
                <ActionsRow
                  key="actions-row"
                  allowCopy={allowCopy}
                  allowDownload={allowDownload}
                  allowUpload={allowUpload}
                  errors={errors}
                  handleCopy={() => handleCopy()}
                  handleDownload={handleDownload}
                  handleUpload={handleUpload}
                  name={name}
                  selectedLanguage={language}
                  setLanguage={setLanguage}
                  toggleLanguages={toggleLanguages}
                >
                  {props.additionalControls}
                </ActionsRow>
              )
            }
          >
            {(!isExpandable || !isCollapsed) && (
              <>
                {props.allowUpload ? (
                  <div
                    id="code-editor-dropzone"
                    {...dropzone.getRootProps({ disabled })}
                    style={{ width: '100%', height: '100%' }}
                  >
                    <input
                      id="code-editor-dropzone-input"
                      {...dropzone.getInputProps()}
                      ref={fileInputRef}
                    />
                    <DataEditor<TFieldValues, TFieldName>
                      setError={setFormError}
                      clearErrors={clearErrors}
                      id={id}
                      data-cy={id}
                      name={name}
                      language={language}
                      value={value}
                      onChange={handleChange}
                      isReadOnly={isReadOnly || isSubmitting}
                      invalid={!(validate && isValidating) && error?.message !== undefined}
                    />
                  </div>
                ) : (
                  <DataEditor<TFieldValues, TFieldName>
                    setError={setFormError}
                    clearErrors={clearErrors}
                    id={id}
                    data-cy={id}
                    name={name}
                    language={language}
                    value={value}
                    onChange={handleChange}
                    isReadOnly={isReadOnly || isSubmitting}
                    invalid={!(validate && isValidating) && error?.message !== undefined}
                    disableLineNumbers={disableLineNumbers}
                  />
                )}
              </>
            )}
          </PageFormGroup>
        );
      }}
      rules={{
        required:
          typeof label === 'string' && isRequired === true
            ? {
                value: true,
                message: `${capitalizeFirstLetter(label.toLocaleLowerCase())} is required.`,
              }
            : undefined,
        validate: props.validate,
      }}
    />
  );
}
