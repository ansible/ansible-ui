import { t } from 'i18next';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PageForm,
  PageFormCheckbox,
  PageFormDataEditor,
  PageFormTextInput,
} from '../../../../framework';
import { PageFormSection } from '../../../../framework/PageForm/Utils/PageFormSection';

export interface OptionsResponse {
  actions: {
    PUT: Record<
      string,
      OptionsAction<string | number | boolean | string[] | number[] | boolean[] | null>
    >;
  };
}

export interface OptionsAction<T> {
  type: T;
  required: boolean;
  label: string;
  help_text: string;
  category: string;
  category_slug: string;
  default: T;
}

export function OptionActionsForm(props: { options: OptionsAction<any>[]; data: unknown }) {
  const categoryToOptions = useMemo(() => {
    const categoryToOptions: Record<string, OptionsAction<any>[]> = {};
    for (const option of props.options) {
      if (!categoryToOptions[option.category]) categoryToOptions[option.category] = [];
      categoryToOptions[option.category].push(option);
    }
    return categoryToOptions;
  }, [props.options]);

  const navigate = useNavigate();

  return (
    <PageForm defaultValue={props.data} submitText={t('Save')} onCancel={() => navigate(-1)}>
      {Object.entries(categoryToOptions).map(([category, options]) => {
        return (
          <PageFormSection key={category} title={category}>
            {options.map((option, key) => {
              return <OptionActionsFormInput key={key} option={option} />;
            })}
          </PageFormSection>
        );
      })}
    </PageForm>
  );
}
export function OptionActionsFormInput(props: { option: OptionsAction<unknown> }) {
  const option = props.option;
  switch (option.type) {
    case 'string':
      return (
        <PageFormTextInput
          label={option.label}
          name={option.category}
          labelHelp={option.help_text}
        />
      );
    case 'integer':
      return (
        <PageFormTextInput
          label={option.label}
          name={option.category}
          labelHelp={option.help_text}
          type="number"
        />
      );
    case 'boolean':
      return <PageFormCheckbox label={option.label} name={option.category} />;
    case 'list':
      return (
        <PageFormDataEditor
          label={option.label}
          name={option.category}
          labelHelp={option.help_text}
          allowUpload={false}
          allowCopy={false}
          allowDownload={false}
          disableLineNumbers
        />
      );
    case 'nested object':
      return (
        <PageFormDataEditor
          label={option.label}
          name={option.category}
          labelHelp={option.help_text}
          allowUpload={false}
          allowCopy={false}
          allowDownload={false}
          disableLineNumbers
        />
      );
    case 'certificate':
      return (
        <PageFormDataEditor
          label={option.label}
          name={option.category}
          labelHelp={option.help_text}
          allowUpload={false}
          allowCopy={false}
          allowDownload={false}
          disableLineNumbers
        />
      );
    default:
      return (
        <div style={{ color: 'red' }}>
          {option.label} - {option.type}
        </div>
      );
  }
}
