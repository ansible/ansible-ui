import { t } from 'i18next';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PageForm,
  PageFormCheckbox,
  PageFormDataEditor,
  PageFormTextInput,
} from '../../../../framework';
import { usePatchRequest } from '../../../common/crud/usePatchRequest';
import { awxAPI } from '../../common/api/awx-utils';

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
