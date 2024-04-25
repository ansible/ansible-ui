import { t } from 'i18next';
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PageFormCheckbox,
  PageFormDataEditor,
  PageFormSelect,
  PageFormTextInput,
} from '../../../../framework';
import { PageFormSection } from '../../../../framework/PageForm/Utils/PageFormSection';
import { usePatchRequest } from '../../../common/crud/usePatchRequest';
import { AwxPageForm } from '../../common/AwxPageForm';
import { awxAPI } from '../../common/api/awx-utils';

export interface AwxSettingsOptionsResponse {
  actions: {
    PUT: Record<string, AwxSettingsOptionsAction>;
  };
}

export type AwxSettingsOptionsAction =
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
  hidden?: boolean;
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
  min_value?: number;
  max_value?: number;
  unit?: string;
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
  choices: [value: string, display_name: string][];
}

interface IOptionDateTimeAction extends IOptionActionBase {
  type: 'datetime';
}

export function AwxSettingsForm(props: {
  options: Record<string, AwxSettingsOptionsAction>;
  data: object;
}) {
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
      navigate('..');
    },
    [navigate, patch, props.options]
  );

  // This is used for AWX LDAP settings which need groups
  const { options, groups } = useMemo(() => {
    const options: Record<string, AwxSettingsOptionsAction> = {};
    const groups: { groupName: string; options: Record<string, AwxSettingsOptionsAction> }[] = [];
    for (const [key, option] of Object.entries(props.options)) {
      if (
        key.startsWith('AUTH_LDAP_1') ||
        key.startsWith('AUTH_LDAP_2') ||
        key.startsWith('AUTH_LDAP_3') ||
        key.startsWith('AUTH_LDAP_4') ||
        key.startsWith('AUTH_LDAP_5')
      ) {
        const groupName = key.substring(5, 11).replace(/_/g, ' ');
        let group = groups.find((group) => group.groupName === groupName);
        if (!group) {
          group = { groupName, options: {} };
          groups.push(group);
        }
        group.options[key] = option;
      } else if (key.startsWith('AUTH_LDAP')) {
        const groupName = key.substring(5, 9).replace(/_/g, ' ');
        let group = groups.find((group) => group.groupName === groupName);
        if (!group) {
          group = { groupName, options: {} };
          groups.push(group);
        }
        group.options[key] = option;
      } else {
        options[key] = option;
      }
    }
    return { options, groups };
  }, [props.options]);

  return (
    <AwxPageForm
      defaultValue={props.data}
      submitText={t('Save')}
      onCancel={() => navigate('..')}
      onSubmit={onSubmit}
    >
      {Object.entries(options).map(([key, option]) => {
        return <OptionActionsFormInput key={key} name={key} option={option} />;
      })}
      {groups.map((group) => {
        return (
          <PageFormSection
            key={group.groupName}
            title={group.groupName}
            canCollapse
            defaultCollapsed={group.groupName !== 'LDAP'}
          >
            {Object.entries(group.options).map(([key, option]) => {
              return <OptionActionsFormInput key={key} name={key} option={option} />;
            })}
          </PageFormSection>
        );
      })}
    </AwxPageForm>
  );
}

export function OptionActionsFormInput(props: { name: string; option: AwxSettingsOptionsAction }) {
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
          min={option.min_value}
          max={option.max_value}
        />
      );
    case 'boolean':
      return (
        <PageFormSection singleColumn>
          <PageFormCheckbox
            label={option.label}
            name={props.name}
            labelHelpTitle={option.label}
            labelHelp={option.help_text}
          />
        </PageFormSection>
      );
    case 'list':
      return (
        <PageFormSection singleColumn>
          <PageFormDataEditor
            label={option.label}
            name={props.name}
            labelHelpTitle={option.label}
            labelHelp={option.help_text}
            format="object"
            isRequired={option.required}
            isArray
          />
        </PageFormSection>
      );
    case 'nested object':
      return (
        <PageFormSection singleColumn>
          <PageFormDataEditor
            label={option.label}
            name={props.name}
            labelHelpTitle={option.label}
            labelHelp={option.help_text}
            format="object"
            isRequired={option.required}
          />
        </PageFormSection>
      );
    case 'certificate':
      return (
        <PageFormSection singleColumn>
          <PageFormDataEditor
            label={option.label}
            name={props.name}
            labelHelpTitle={option.label}
            labelHelp={option.help_text}
            format="object"
            isRequired={option.required}
          />
        </PageFormSection>
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
