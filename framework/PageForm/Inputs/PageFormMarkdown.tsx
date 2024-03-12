import { Flex, FlexItem, ToggleGroup, ToggleGroupItem } from '@patternfly/react-core';
import { ReactNode, useCallback, useRef, useState } from 'react';
import {
  Controller,
  FieldPathByValue,
  FieldValues,
  PathValue,
  Validate,
  useFormContext,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { DataEditorButtons, usePageAlertToaster } from '../..';
import { DataEditor } from '../../components/DataEditor';
import { DropZone } from '../../components/DropZone';
import { ExpandIcon } from '../../components/icons/ExpandIcon';
import { useClipboard } from '../../hooks/useClipboard';
import { useID } from '../../hooks/useID';
import { downloadTextFile } from '../../utils/download-file';
import { PageFormGroup } from './PageFormGroup';
import { PageMarkdownDetail } from './PageMarkdownDetail';
import { useRequiredValidationRule } from './validation-hooks';

export type PageFormMarkdownInputProps<
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

export function PageFormMarkdown<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPathByValue<
    TFieldValues,
    object | string | undefined | null
  > = FieldPathByValue<TFieldValues, object | string | undefined | null>,
>(props: PageFormMarkdownInputProps<TFieldValues, TFieldName>) {
  const { t } = useTranslation();
  const { name, disableCopy, disableUpload, disableDownload, disableExpand, validate } = props;
  const id = useID(props);
  const {
    formState: { isSubmitting, isValidating },
    setError,
    getValues,
    setValue,
    clearErrors,
    control,
  } = useFormContext<TFieldValues>();
  const [isExpanded, setExpanded] = useState(!props.defaultCollapsed);

  const alertToaster = usePageAlertToaster();
  const { writeToClipboard } = useClipboard();

  const handleCopy = useCallback(
    () => writeToClipboard(getValues(name)),
    [getValues, name, writeToClipboard]
  );

  const onDrop = useCallback(
    (contents: string) => setValue(name, contents as PathValue<TFieldValues, TFieldName>),
    [name, setValue]
  );

  const dropZoneInputRef = useRef<HTMLInputElement>(null);
  const handleUpload = useCallback(() => dropZoneInputRef.current?.click(), []);

  const handleDownload = useCallback(() => {
    const fileName = name || 'data';
    downloadTextFile(fileName, getValues(name), 'md');
    alertToaster.addAlert({ variant: 'success', title: t('File downloaded'), timeout: true });
  }, [alertToaster, getValues, name, t]);

  const required = useRequiredValidationRule(props.label, props.isRequired);

  const [preview, setPreview] = useState(false);

  return (
    <Controller<TFieldValues, TFieldName>
      name={name}
      control={control}
      shouldUnregister
      render={({ field: { name, onChange, value }, fieldState: { error } }) => {
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
              <MarkdownActions
                handleCopy={!disableCopy && handleCopy}
                handleUpload={!disableUpload && handleUpload}
                handleDownload={!disableDownload && handleDownload}
                preview={preview}
                setPreview={setPreview}
              >
                {props.additionalControls}
              </MarkdownActions>
            }
            helperTextInvalid={!(validate && isValidating) && error?.message?.split('\n')}
            isRequired={props.isRequired}
          >
            {isExpanded && !preview && (
              <DropZone
                onDrop={onDrop}
                isDisabled={isSubmitting || props.isReadOnly}
                inputRef={dropZoneInputRef}
                accept={{ 'text/markdown': ['.md'] }}
              >
                <DataEditor
                  data-cy={id}
                  id={id}
                  name={name}
                  language="markdown"
                  value={value || ''}
                  onChange={onChange}
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
            {isExpanded && preview && <PageMarkdownDetail value={value} />}
            {!isExpanded && <div className="pf-v5-c-form-control" />}
          </PageFormGroup>
        );
      }}
      rules={{ required, validate: props.validate }}
    />
  );
}

function MarkdownActions(props: {
  handleCopy: (() => void) | false;
  handleDownload: (() => void) | false;
  handleUpload: (() => void) | false;
  preview: boolean;
  setPreview: (preview: boolean) => void;
  children?: ReactNode;
}) {
  const { t } = useTranslation();
  const { handleCopy, handleDownload, handleUpload, preview, setPreview } = props;
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
            id="toggle-markdown"
            data-cy="toggle-markdown"
            aria-label={t('Toggle to Markdown')}
            isSelected={!preview}
            text="Markdown"
            type="button"
            onChange={() => setPreview(false)}
          />
          <ToggleGroupItem
            id="toggle-preview"
            data-cy="toggle-preview"
            aria-label={t('Toggle to Preview')}
            isSelected={preview}
            text="Preview"
            type="button"
            onChange={() => setPreview(true)}
          />
        </ToggleGroup>
      </FlexItem>
    </Flex>
  );
}
