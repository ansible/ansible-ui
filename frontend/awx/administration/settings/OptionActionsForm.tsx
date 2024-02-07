import { t } from 'i18next';
import { useNavigate } from 'react-router-dom';
import {
  PageForm,
  PageFormCheckbox,
  PageFormDataEditor,
  PageFormTextInput,
} from '../../../../framework';

export interface OptionsResponse {
  actions: {
    PUT: Record<string, OptionsAction>;
  };
}

export interface OptionsAction {
  type: 'string' | 'integer' | 'boolean' | 'list' | 'nested object' | 'certificate';
  required: boolean;
  label: string;
  help_text: string;
  category: string;
  category_slug: string;
  default: unknown;
}

export function OptionActionsForm(props: { options: Record<string, OptionsAction>; data: object }) {
  const navigate = useNavigate();
  return (
    <PageForm defaultValue={props.data} submitText={t('Save')} onCancel={() => navigate(-1)}>
      {Object.entries(props.options).map(([key, option]) => {
        return <OptionActionsFormInput key={key} name={key} option={option} />;
      })}
      {/* {Object.entries(categoryToOptions).map(([category, options]) => {
        return (
          <PageFormSection key={category} title={category}>
            {options.map((option, key) => {
              return <OptionActionsFormInput key={key} option={option} />;
            })}
          </PageFormSection>
        );
      })} */}
    </PageForm>
  );
}
export function OptionActionsFormInput(props: { name: string; option: OptionsAction }) {
  const option = props.option;
  switch (option.type) {
    case 'string':
      return (
        <PageFormTextInput
          label={option.label}
          name={props.name}
          labelHelp={option.help_text}
          helperText={props.name}
        />
      );
    case 'integer':
      return (
        <PageFormTextInput
          label={option.label}
          name={props.name}
          labelHelp={option.help_text}
          type="number"
          helperText={props.name}
        />
      );
    case 'boolean':
      return <PageFormCheckbox label={option.label} name={props.name} />;
    case 'list':
      return (
        <PageFormDataEditor
          label={option.label}
          name={props.name}
          labelHelp={option.help_text}
          allowUpload={false}
          allowCopy={false}
          allowDownload={false}
          // disableLineNumbers
          toggleLanguages={['json', 'yaml']}
          language="json"
        />
      );
    case 'nested object':
      return (
        <PageFormDataEditor
          label={option.label}
          name={props.name}
          labelHelp={option.help_text}
          allowUpload={false}
          allowCopy={false}
          allowDownload={false}
          // disableLineNumbers
          toggleLanguages={['json', 'yaml']}
          language="json"
        />
      );
    case 'certificate':
      return (
        <PageFormDataEditor
          label={option.label}
          name={props.name}
          labelHelp={option.help_text}
          allowUpload={false}
          allowCopy={false}
          allowDownload={false}
          // disableLineNumbers
          toggleLanguages={['json', 'yaml']}
          language="json"
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
