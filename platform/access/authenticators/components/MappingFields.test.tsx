import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';
import { AuthenticatorMapType } from '../../../interfaces/AuthenticatorMap';
import { MappingFields } from './MappingFields';
import { AuthenticatorMapValues } from './AuthenticatorForm';

vi.mock('../../organizations/components/PageFormPlatformOrganizationNameSelect', () => ({
  PageFormPlatformOrganizationNameSelect: () => (
    <div data-testid="platform-organization-select">Organization</div>
  ),
}));

vi.mock('../../organizations/components/PageFormPlatformTeamNameSelect', () => ({
  PageFormPlatformTeamNameSelect: () => <div data-testid="platform-team-select">Team</div>,
}));

vi.mock('../../roles/components/PageFormPlatformRoleNameSelect', () => ({
  PageFormPlatformRoleNameSelect: (props: { onChange?: (value: string) => void }) => (
    <>
      <button
        type="button"
        data-testid="trigger-team-role-change"
        onClick={() => props.onChange?.('TeamRole')}
      >
        Set team-scoped role
      </button>
      <button
        type="button"
        data-testid="trigger-org-role-change"
        onClick={() => props.onChange?.('OrgOnlyRole')}
      >
        Set org-scoped role
      </button>
    </>
  ),
}));

vi.mock('./MappingAttributesSubform', () => ({
  MappingAttributesSubform: () => <div data-testid="mapping-attributes-subform" />,
}));

vi.mock('@ansible/ansible-ui-framework/PageForm/Inputs/PageFormCreatableSelect', () => ({
  PageFormCreatableSelect: (props: { id: string }) => (
    <div id={props.id} data-testid="groups-creatable-mock" />
  ),
}));

function MappingFieldsTestWrapper(
  props: Readonly<{
    defaultValues: Partial<AuthenticatorMapValues>;
    roleTypes: { [k: string]: string };
  }>
) {
  const methods = useForm<AuthenticatorMapValues>({
    defaultValues: props.defaultValues as AuthenticatorMapValues,
  });
  return (
    <FormProvider {...methods}>
      <MappingFields roleTypes={props.roleTypes} />
    </FormProvider>
  );
}

describe('MappingFields', () => {
  it('shows team mapping fields when map type is team', () => {
    render(
      <MappingFieldsTestWrapper
        roleTypes={{}}
        defaultValues={{
          map_type: AuthenticatorMapType.team,
          name: '',
          revoke: false,
          trigger: 'always',
        }}
      />
    );

    expect(screen.getByTestId('platform-organization-select')).toBeInTheDocument();
    expect(screen.getByTestId('platform-team-select')).toBeInTheDocument();
  });

  it('shows organization mapping fields when map type is organization', () => {
    render(
      <MappingFieldsTestWrapper
        roleTypes={{}}
        defaultValues={{
          map_type: AuthenticatorMapType.organization,
          name: '',
          revoke: false,
          trigger: 'always',
        }}
      />
    );

    expect(screen.getByTestId('platform-organization-select')).toBeInTheDocument();
    expect(screen.queryByTestId('platform-team-select')).not.toBeInTheDocument();
  });

  it('shows groups conditional fields when trigger is groups', () => {
    render(
      <MappingFieldsTestWrapper
        roleTypes={{}}
        defaultValues={{
          map_type: AuthenticatorMapType.allow,
          name: '',
          revoke: false,
          trigger: 'groups',
          conditional: 'or',
          groups_value: [{ name: 'admins' }],
        }}
      />
    );

    expect(screen.getByTestId('groups-creatable-mock')).toBeInTheDocument();
  });

  it('shows mapping attributes subform when trigger is attributes', () => {
    render(
      <MappingFieldsTestWrapper
        roleTypes={{}}
        defaultValues={{
          map_type: AuthenticatorMapType.allow,
          name: '',
          revoke: false,
          trigger: 'attributes',
          conditional: 'or',
          attributes: [{ attribute: 'a', comparison: 'contains', value: 'b' }],
        }}
      />
    );

    expect(screen.getByTestId('mapping-attributes-subform')).toBeInTheDocument();
  });

  it('shows team select when a role with shared.team content type is selected', async () => {
    const user = userEvent.setup();

    render(
      <MappingFieldsTestWrapper
        roleTypes={{ TeamRole: 'shared.team' }}
        defaultValues={{
          map_type: AuthenticatorMapType.role,
          name: '',
          revoke: false,
          trigger: 'always',
          role: 'TeamRole',
        }}
      />
    );

    await user.click(screen.getByTestId('trigger-team-role-change'));

    expect(screen.getByTestId('platform-team-select')).toBeInTheDocument();
  });

  it('requires organization when role maps to shared.organization', async () => {
    const user = userEvent.setup();

    render(
      <MappingFieldsTestWrapper
        roleTypes={{ OrgOnlyRole: 'shared.organization' }}
        defaultValues={{
          map_type: AuthenticatorMapType.role,
          name: '',
          revoke: false,
          trigger: 'always',
          role: 'OrgOnlyRole',
        }}
      />
    );

    await user.click(screen.getByTestId('trigger-org-role-change'));

    expect(screen.getByTestId('platform-organization-select')).toBeInTheDocument();
  });
});
