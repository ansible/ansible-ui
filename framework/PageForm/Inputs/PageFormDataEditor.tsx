import { useCallback, useEffect, useState } from 'react';
import {
  Controller,
  FieldPathByValue,
  FieldValues,
  PathValue,
  useFormContext,
  Validate,
} from 'react-hook-form';
import { FormGroupTextInputProps, usePageAlertToaster } from '../..';
import { capitalizeFirstLetter } from '../../utils/strings';
import { PageFormGroup } from './PageFormGroup';
import { isJsonObject, isJsonString, jsonToYaml, yamlToJson } from '../../utils/codeEditorUtils';
import { useTranslation } from 'react-i18next';
import {
  ToggleGroup,
  ToggleGroupItem as PFToggleGroupItem,
  AlertProps,
} from '@patternfly/react-core';
import { AngleRightIcon, CopyIcon } from '@patternfly/react-icons';
import styled from 'styled-components';
import { DataEditor } from './DataEditor';

const ToggleGroupItem = styled(PFToggleGroupItem)`
  &&:first-child#copy-button {
    margin-right: auto;
  }
`;

const ErrorWrapper = styled.p`
  color: var(--pf-c-form__helper-text--m-error--Color);
  font-size: var(--pf-c-form__helper-text--FontSize);
`;
export type PageFormDataEditorInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPathByValue<TFieldValues, undefined | string> = FieldPathByValue<
    TFieldValues,
    undefined | string
  >
> = {
  name: TFieldName;
  validate?: Validate<string, TFieldValues> | Record<string, Validate<string, TFieldValues>>;
  toggleLanguages?: string[];
  isExpandable?: boolean;
  defaultExpanded?: boolean;
} & Omit<FormGroupTextInputProps, 'onChange'>;

export function PageFormDataEditor<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPathByValue<TFieldValues, undefined | string> = FieldPathByValue<
    TFieldValues,
    undefined | string
  >
>(props: PageFormDataEditorInputProps<TFieldValues, TFieldName>) {
  const { t } = useTranslation();
  const { isReadOnly, validate, isExpandable, defaultExpanded, ...formGroupInputProps } = props;
  const { label, name, isRequired } = props;
  const {
    formState: { isSubmitting, isValidating, errors },
    setError: setFormError,
    clearErrors,
    getValues,
    control,
    setValue,
  } = useFormContext<TFieldValues>();

  useEffect(() => {
    if (!errors[name]) {
      clearErrors(name);
    }
  }, [errors, name, clearErrors]);

  const id = props.id ?? name.split('.').join('-');
  const [selectedLanguage, setSelectedLanguage] = useState('yaml');
  const [isCollapsed, setCollapsed] = useState(!defaultExpanded);

  const handleLanguageChange = useCallback(
    (language: string) => {
      const value = getValues(name);

      if ((language !== 'json' && language !== 'yaml') || !value) return;

      if (isJsonString(value)) {
        return language === 'json'
          ? setValue(name, value)
          : setValue(name, jsonToYaml(value) as PathValue<TFieldValues, TFieldName>);
      }

      if (isJsonObject(value)) {
        return language === 'json'
          ? setValue(name, value)
          : setValue(
              name,
              jsonToYaml(JSON.stringify(value)) as PathValue<TFieldValues, TFieldName>
            );
      }

      language === 'json'
        ? setValue(name, yamlToJson(value) as PathValue<TFieldValues, TFieldName>)
        : setValue(name, value);
    },
    [getValues, name, setValue]
  );

  // This needs a try catch block because there is a short period of time between the syntax
  // error getting registered and the buttons being disabled.  If a user is quick enough they could
  // try make a syntax error and toggle the language before the buttons are disabled.

  const setLanguage: (language: string) => void = useCallback(
    (language) => {
      try {
        handleLanguageChange(language);
        setSelectedLanguage(language);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setFormError(name, { message: err.message });
        } else {
          setFormError(name, { message: t('Invalid syntax') });
        }
      }
    },
    [handleLanguageChange, name, setFormError, t]
  );

  const alertToaster = usePageAlertToaster();

  const handleCopy = useCallback(async () => {
    const alert: AlertProps = {
      variant: 'success',
      title: t('Copied to clipboard'),
    };
    try {
      await navigator.clipboard.writeText(getValues(name));
      alertToaster.addAlert(alert);
    } catch (err: unknown) {
      if (err instanceof Error) {
        alertToaster.replaceAlert(alert, {
          variant: 'danger',
          title: t('Failed to copy to clipboard'),
          children: err instanceof Error && err.message,
        });
      } else {
        alertToaster.replaceAlert(alert, {
          variant: 'danger',
          title: t('Failed to copy to clipboard'),
          children: t('Unable to copy'),
        });
      }
    }
  }, [alertToaster, t, getValues, name]);

  const toggleItems = [
    <ToggleGroupItem
      key="copy-button"
      id="copy-button"
      aria-label={t('Copy to clipboard')}
      isSelected={false}
      isDisabled={false}
      icon={<CopyIcon />}
      type="button"
      onClick={() => void handleCopy()}
    />,
  ];
  if (props.toggleLanguages) {
    props.toggleLanguages.forEach((language) => {
      toggleItems.push(
        <ToggleGroupItem
          key={language}
          id={`toggle-${language}`}
          aria-label={t('Toggle to {{language}}')}
          isSelected={selectedLanguage === language}
          isDisabled={Boolean(errors[name])}
          text={language}
          type="button"
          onChange={() => setLanguage(language)}
        />
      );
    });
  }
  return (
    <Controller<TFieldValues, TFieldName>
      name={name}
      control={control}
      shouldUnregister
      render={({ field: { name, onChange, value }, fieldState: { error } }) => {
        const errorSet = [...new Set(error?.message?.split('\n'))];
        return (
          <PageFormGroup
            {...formGroupInputProps}
            label={
              isExpandable ? (
                <span style={{ alignItems: 'center' }}>
                  <AngleRightIcon
                    style={{
                      transform: isCollapsed ? 'rotate(0deg)' : 'rotate(90deg)',
                      transition: 'transform',
                    }}
                    onClick={() => setCollapsed((c) => !c)}
                    aria-label={t('Expand or collapse extra variables')}
                  />
                  {props.label}
                </span>
              ) : (
                props.label
              )
            }
            id={id}
            helperTextInvalid={
              !(validate && isValidating) &&
              errorSet?.map((e) => <ErrorWrapper key={e}>{e}</ErrorWrapper>)
            }
          >
            {(!isExpandable || !isCollapsed) && (
              <>
                <ToggleGroup isCompact>{toggleItems}</ToggleGroup>
                <DataEditor<TFieldValues, TFieldName>
                  setError={setFormError}
                  clearErrors={clearErrors}
                  id={id}
                  name={name}
                  language={selectedLanguage}
                  value={value}
                  onChange={onChange}
                  isReadOnly={isReadOnly || isSubmitting}
                  invalid={!(validate && isValidating) && error?.message !== undefined}
                />
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
