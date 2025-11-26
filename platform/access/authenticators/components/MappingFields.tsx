import { PageFormCheckbox, PageFormSelect, PageFormTextInput } from '@ansible/ansible-ui-framework';
import { PageFormCreatableSelect } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormCreatableSelect';
import { PageFormGroup } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormGroup';
import { PageFormHidden } from '@ansible/ansible-ui-framework/PageForm/Utils/PageFormHidden';
import { PageFormSection } from '@ansible/ansible-ui-framework/PageForm/Utils/PageFormSection';
import { useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { AuthenticatorMapType } from '../../../interfaces/AuthenticatorMap';
import { PageFormPlatformOrganizationNameSelect } from '../../organizations/components/PageFormPlatformOrganizationNameSelect';
import { PageFormPlatformTeamNameSelect } from '../../organizations/components/PageFormPlatformTeamNameSelect';
import { PageFormPlatformRoleNameSelect } from '../../roles/components/PageFormPlatformRoleNameSelect';
import { AuthenticatorMapValues } from './AuthenticatorForm';
import { MappingAttributesSubform } from './MappingAttributesSubform';

export const MappingFieldsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 24px 24px;
  gap: var(--pf-t--global--spacer--md);

  & > button {
    justify-self: start;
    align-self: start;
    margin-top: 30px;
  }
`;

export function MappingFields(props: { roleTypes: { [k: string]: string } }) {
  const { roleTypes } = props;
  const { getValues } = useFormContext();
  const { t } = useTranslation();
  const formValues = getValues() as AuthenticatorMapValues;
  const roleName = formValues.role ?? '';
  const [roleType, setRoleType] = useState(roleTypes[roleName] ?? '');
  const isOrgRoleSelected = roleType === 'shared.organization';
  const isTeamRoleSelected = roleType === 'shared.team';

  const mapType = useWatch({
    name: 'map_type',
  }) as AuthenticatorMapType;

  const groupsValue = useWatch({
    name: 'groups_value',
  }) as { name: string }[];

  let roleContentType = null;
  if (mapType === AuthenticatorMapType.team) {
    roleContentType = 'shared.team';
  }
  if (mapType === AuthenticatorMapType.organization) {
    roleContentType = 'shared.organization';
  }
  const options = new Set<string>();
  groupsValue?.forEach(({ name }) => options.add(name));

  const groupOptions = Array.from(options).map((name) => ({
    value: name,
    label: name,
  }));

  return (
    <>
      <PageFormSection>
        <PageFormSelect
          id={`map_type`}
          name={`map_type`}
          label={t('Authentication mapping')}
          placeholderText={t('Select comparison')}
          options={[
            { value: 'allow', label: t('Allow') },
            { value: 'organization', label: t('Organization') },
            { value: 'team', label: t('Team') },
            { value: 'role', label: t('Role') },
            { value: 'is_superuser', label: t('Superuser') },
          ]}
          isRequired
        />
        <PageFormTextInput
          id={`name`}
          name={`name`}
          label={t('Rule name')}
          isRequired
          placeholder={t('Enter rule name')}
          labelHelp={t(
            'The rule name is a unique string that identifies the rule, and will appear in the Mapping order step.'
          )}
        />
        <PageFormSelect
          id={`trigger`}
          name={`trigger`}
          label={t('When to apply the rule')}
          labelHelp={t('The rule condition defines how or when the rule is activated.')}
          options={[
            {
              value: 'always',
              label: t('Always'),
            },
            {
              value: 'never',
              label: t('Never'),
            },
            {
              value: 'groups',
              label: t('Based on groups'),
            },
            {
              value: 'attributes',
              label: t('Based on attributes'),
            },
          ]}
          placeholderText={t('Select rule condition')}
          isRequired
        />
      </PageFormSection>
      <PageFormSection singleColumn>
        <PageFormGroup label={t('Options')}>
          <PageFormCheckbox
            labelHelp={
              'Selecting this option prevents non-matching user groups from being added to this resource.'
            }
            name={`revoke`}
            label={t('Block non-matching users')}
          />
        </PageFormGroup>
      </PageFormSection>
      <PageFormSection>
        <PageFormHidden watch={`trigger`} hidden={(value) => value !== 'groups'}>
          <PageFormSelect
            id={`groups-conditional`}
            label={t('How to apply the rule')}
            options={[
              { value: 'or', label: t('at least one') },
              { value: 'and', label: t('all') },
            ]}
            placeholderText={t('Select condition type')}
            name={`conditional`}
            isRequired
          />
          <PageFormCreatableSelect
            id={`groups-value`}
            name={`groups_value`}
            label={t('Groups')}
            options={groupOptions}
            isRequired
            placeholderText={t('Select groups')}
          />
        </PageFormHidden>
        <PageFormHidden watch={`trigger`} hidden={(value) => value !== 'attributes'}>
          <MappingFieldsGrid>
            <PageFormSelect
              id={`attributes-conditional`}
              name={`conditional`}
              label={t('How to apply the rule')}
              placeholderText={t('Select condition type')}
              options={[
                { value: 'or', label: t('at least one') },
                { value: 'and', label: t('all') },
              ]}
              isRequired
            />
          </MappingFieldsGrid>
          <MappingAttributesSubform />
        </PageFormHidden>
        <PageFormHidden
          watch={`map_type`}
          hidden={(value: string) => !['team', 'organization', 'role'].includes(value)}
        >
          <PageFormPlatformRoleNameSelect
            name={`role`}
            contentType={roleContentType}
            onChange={(value: string) => {
              if (value && roleTypes) {
                setRoleType(roleTypes[value] || '');
              }
            }}
            isRequired
          />
          <PageFormPlatformOrganizationNameSelect
            name={`organization`}
            isRequired={
              ['team', 'organization'].includes(mapType) || isOrgRoleSelected || isTeamRoleSelected
            }
          />
        </PageFormHidden>
        <PageFormHidden
          watch={`map_type`}
          hidden={(value: string) => !['team', 'role'].includes(value) || isOrgRoleSelected}
        >
          <PageFormPlatformTeamNameSelect
            name={`team`}
            isRequired={['team'].includes(mapType) || isTeamRoleSelected}
          />
        </PageFormHidden>
      </PageFormSection>
    </>
  );
}
