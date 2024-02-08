import { t } from 'i18next';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PageForm,
  PageFormCheckbox,
  PageFormDataEditor,
  PageFormSelect,
  PageFormTextInput,
} from '../../../../framework';
import { usePatchRequest } from '../../../common/crud/usePatchRequest';
import { awxAPI } from '../../common/api/awx-utils';

export interface OptionsResponse {
  actions: {
    PUT: Record<string, OptionsAction>;
  };
}

export type OptionsAction =
  | IOptionStringAction
  | IOptionChoiceAction
  | IOptionIntegerAction
  | IOptionBooleanAction
  | IOptionListAction
  | IOptionObjectAction
  | IOptionCertificateAction
  | IOptionDateTimeAction
  | IOptionFieldAction;

interface IOptionActionBase {
  label: string;
  category: string;
  category_slug: string;
  required?: boolean;
  help_text?: string;
}

interface IOptionStringAction extends IOptionActionBase {
  type: 'string';
  default?: string;
}

interface IOptionFieldAction extends IOptionActionBase {
  type: 'field';
  default?: string;
}

interface IOptionIntegerAction extends IOptionActionBase {
  type: 'integer';
  default?: number;
}

interface IOptionBooleanAction extends IOptionActionBase {
  type: 'boolean';
  default?: boolean;
}

interface IOptionListAction extends IOptionActionBase {
  type: 'list';
}

interface IOptionObjectAction extends IOptionActionBase {
  type: 'nested object';
}

interface IOptionCertificateAction extends IOptionActionBase {
  type: 'certificate';
}

interface IOptionChoiceAction extends IOptionActionBase {
  type: 'choice';
  default: string;
  choices: [value: string, display_name: string];
}

interface IOptionDateTimeAction extends IOptionActionBase {
  type: 'datetime';
}

export function OptionActionsForm(props: { options: Record<string, OptionsAction>; data: object }) {
  const navigate = useNavigate();
  const patch = usePatchRequest();
  const onSubmit = useCallback(
    async (data: object) => {
      // Only send the data that is in the options
      const patchData: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(data)) {
        if (Object.keys(props.options).includes(key)) {
          patchData[key] = value;
        }
      }
      await patch(awxAPI`/settings/all/`, patchData);
      navigate(-1);
    },
    [navigate, patch, props.options]
  );
  return (
    <PageForm
      defaultValue={props.data}
      submitText={t('Save')}
      onCancel={() => navigate(-1)}
      onSubmit={onSubmit}
    >
      {Object.entries(props.options).map(([key, option]) => {
        return <OptionActionsFormInput key={key} name={key} option={option} />;
      })}
    </PageForm>
  );
}
export function OptionActionsFormInput(props: { name: string; option: OptionsAction }) {
  const option = props.option;
  switch (option.type) {
    case 'string':
    case 'field':
      return (
        <PageFormTextInput
          label={option.label}
          name={props.name}
          labelHelpTitle={option.label}
          labelHelp={option.help_text}
          isRequired={option.required}
        />
      );
    case 'integer':
      return (
        <PageFormTextInput
          label={option.label}
          name={props.name}
          labelHelpTitle={option.label}
          labelHelp={option.help_text}
          type="number"
          isRequired={option.required}
        />
      );
    case 'boolean':
      return <PageFormCheckbox label={option.label} name={props.name} />;
    case 'list':
      return (
        <PageFormDataEditor
          label={option.label}
          name={props.name}
          labelHelpTitle={option.label}
          labelHelp={option.help_text}
          allowUpload={false}
          allowCopy={false}
          allowDownload={false}
          // disableLineNumbers
          toggleLanguages={['json', 'yaml']}
          language="json"
          isRequired={option.required}
        />
      );
    case 'nested object':
      return (
        <PageFormDataEditor
          label={option.label}
          name={props.name}
          labelHelpTitle={option.label}
          labelHelp={option.help_text}
          allowUpload={false}
          allowCopy={false}
          allowDownload={false}
          // disableLineNumbers
          toggleLanguages={['json', 'yaml']}
          language="json"
          isRequired={option.required}
        />
      );
    case 'certificate':
      return (
        <PageFormDataEditor
          label={option.label}
          name={props.name}
          labelHelpTitle={option.label}
          labelHelp={option.help_text}
          allowUpload={false}
          allowCopy={false}
          allowDownload={false}
          // disableLineNumbers
          toggleLanguages={['json', 'yaml']}
          language="json"
          isRequired={option.required}
        />
      );
    case 'choice':
      return (
        <PageFormSelect
          label={option.label}
          name={props.name}
          labelHelpTitle={option.label}
          labelHelp={option.help_text}
          options={option.choices.map((choice) => ({ value: choice[0], label: choice[1] }))}
          isRequired={option.required}
        />
      );
    case 'datetime':
      return (
        <PageFormTextInput
          label={option.label}
          name={props.name}
          labelHelpTitle={option.label}
          labelHelp={option.help_text}
          type="datetime-local"
          isRequired={option.required}
        />
      );

    default:
      return <pre style={{ color: 'red' }}>{JSON.stringify(option, null, 2)}</pre>;
  }
}
