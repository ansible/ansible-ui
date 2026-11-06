import { render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PageFormRolePermissionsSelect } from './PageFormPermissionsSelect';

const permissionsState = vi.hoisted(() => ({
  permissions: {
    'awx.view_credential': 'View credential',
    'awx.change_credential': 'Change credential',
  } as Record<string, string>,
}));

vi.mock('../../../../framework/PageForm/Inputs/PageFormMultiSelect', () => ({
  PageFormMultiSelect: (props: {
    name: string;
    label: string;
    options: { label: string; value: string; group: string }[];
    placeholder: string;
    isRequired?: boolean;
    isDisabled?: string;
  }) => (
    <div data-testid="multi-mock">
      <span data-testid="field-name">{props.name}</span>
      <span data-testid="label">{props.label}</span>
      <span data-testid="placeholder">{props.placeholder}</span>
      <span data-testid="required">{props.isRequired ? 'yes' : 'no'}</span>
      <span data-testid="disabled">{props.isDisabled ?? 'no'}</span>
      <ul data-testid="options">
        {props.options.map((o) => (
          <li key={o.value} data-testid={`opt-${o.value}`}>
            {o.label}|{o.group}
          </li>
        ))}
      </ul>
    </div>
  ),
}));

vi.mock('@ansible/common-ui/access/components/usePlatformRoleMetadata', () => ({
  groupFromRoleType: (key: string) => `group:${key.split('.')[0] ?? ''}`,
  usePlatformRoleMetadata: () => ({
    content_types: {
      'awx.credential': {
        displayName: 'Credential',
        permissions: permissionsState.permissions,
      },
    },
  }),
}));

function Wrapper({ children }: { readonly children: React.ReactNode }) {
  const form = useForm<{ permissions: string[] }>({ defaultValues: { permissions: [] } });
  return (
    <MemoryRouter>
      <FormProvider {...form}>{children}</FormProvider>
    </MemoryRouter>
  );
}

describe('PageFormRolePermissionsSelect', () => {
  beforeEach(() => {
    permissionsState.permissions = {
      'awx.view_credential': 'View credential',
      'awx.change_credential': 'Change credential',
    };
  });

  it('maps permissions for the content type and forwards field props', () => {
    render(
      <Wrapper>
        <PageFormRolePermissionsSelect
          name="ignored-by-component"
          contentType="awx.credential"
          isRequired
          isDisabled="Permission denied"
        />
      </Wrapper>
    );

    expect(screen.getByTestId('field-name')).toHaveTextContent('permissions');
    expect(screen.getByTestId('label')).toHaveTextContent('Permissions');
    expect(screen.getByTestId('placeholder')).toHaveTextContent('Select permissions');
    expect(screen.getByTestId('required')).toHaveTextContent('yes');
    expect(screen.getByTestId('disabled')).toHaveTextContent('Permission denied');

    expect(screen.getByTestId('opt-awx.view_credential')).toHaveTextContent(
      'View credential|group:awx'
    );
    expect(screen.getByTestId('opt-awx.change_credential')).toHaveTextContent(
      'Change credential|group:awx'
    );
  });

  it('renders empty options when content type has no permissions', () => {
    permissionsState.permissions = {};

    render(
      <Wrapper>
        <PageFormRolePermissionsSelect name="x" contentType="awx.credential" />
      </Wrapper>
    );

    expect(screen.getByTestId('options').querySelectorAll('li')).toHaveLength(0);
  });

  it('renders empty options when the content type key is missing', () => {
    render(
      <Wrapper>
        <PageFormRolePermissionsSelect name="x" contentType="unknown.type" />
      </Wrapper>
    );

    expect(screen.getByTestId('options').querySelectorAll('li')).toHaveLength(0);
  });
});
