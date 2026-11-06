import { render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import type { ComponentProps } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { PageFormRoleTypeSelect } from './PageFormRoleTypeSelect';

type RoleTypeSelectProps = ComponentProps<typeof PageFormRoleTypeSelect>;
type PropsWithoutRequiredName = Omit<RoleTypeSelectProps, 'name'> & { name?: string };

vi.mock('../../../../framework/PageForm/Inputs/PageFormSingleSelect', () => ({
  PageFormSingleSelect: (props: {
    name: string;
    label: string;
    options: { label?: string; value: string; group: string; description?: string }[];
    placeholder: string;
    isRequired?: boolean;
    isDisabled?: string;
    disableSortOptions?: boolean;
  }) => (
    <div data-testid="single-mock">
      <span data-testid="field-name">{props.name}</span>
      <span data-testid="label">{props.label}</span>
      <span data-testid="placeholder">{props.placeholder}</span>
      <span data-testid="required">{props.isRequired ? 'yes' : 'no'}</span>
      <span data-testid="disabled">{props.isDisabled ?? 'no'}</span>
      <span data-testid="no-sort">{props.disableSortOptions ? 'yes' : 'no'}</span>
      <ul data-testid="options">
        {props.options.map((o) => (
          <li key={o.value} data-testid={`opt-${o.value}`}>
            {o.label}|{o.group}|{o.description ?? ''}
          </li>
        ))}
      </ul>
    </div>
  ),
}));

const mockMetadata = vi.hoisted(() => ({
  content_types: {
    'shared.team': { displayName: 'Team', permissions: {} },
    'shared.organization': { displayName: 'Organization (meta)', permissions: {} },
    'awx.project': { displayName: 'Project (AWX)', permissions: {} },
    'eda.activation': { displayName: 'Activation (EDA)', permissions: {} },
    'eda.blocked': { displayName: 'Blocked EDA type', permissions: {} },
    'galaxy.namespace': { displayName: 'Namespace (Galaxy)', permissions: {} },
    'galaxy.badtype': { displayName: 'Bad galaxy type', permissions: {} },
    null: { displayName: 'Null key', permissions: {} },
    'custom.other': { displayName: 'Custom other', permissions: {} },
    '.leading-dot': { displayName: 'Leading dot key', permissions: {} },
    nodotservice: { displayName: 'No dot service', permissions: {} },
  },
}));

vi.mock('@ansible/common-ui/access/components/usePlatformRoleMetadata', () => ({
  groupFromRoleType: (key: string) => `grp:${key.split('.')[0] ?? ''}`,
  usePlatformRoleMetadata: () => ({
    content_types: mockMetadata.content_types,
  }),
}));

function Wrapper({ children }: { readonly children: React.ReactNode }) {
  const form = useForm<{ content_type: string }>({ defaultValues: { content_type: '' } });
  return (
    <MemoryRouter>
      <FormProvider {...form}>{children}</FormProvider>
    </MemoryRouter>
  );
}

describe('PageFormRoleTypeSelect', () => {
  it('defaults field name to content_type when name is omitted, disables sort, and builds allowed options', () => {
    const props = {
      isRequired: true,
      isDisabled: 'No access',
    } satisfies Omit<RoleTypeSelectProps, 'name'>;

    render(
      <Wrapper>
        <PageFormRoleTypeSelect {...(props as PropsWithoutRequiredName)} />
      </Wrapper>
    );

    expect(screen.getByTestId('field-name')).toHaveTextContent('content_type');
    expect(screen.getByTestId('label')).toHaveTextContent('Resource type');
    expect(screen.getByTestId('placeholder')).toHaveTextContent('Select resource type');
    expect(screen.getByTestId('required')).toHaveTextContent('yes');
    expect(screen.getByTestId('disabled')).toHaveTextContent('No access');
    expect(screen.getByTestId('no-sort')).toHaveTextContent('yes');

    expect(screen.getByTestId('opt-shared.organization')).toHaveTextContent(
      'Organization||An organization role grants access to all relevant resources within that organization based on permissions.'
    );
    expect(screen.getByTestId('opt-null')).toHaveTextContent(
      'System|Automation Content|A system role grants access to all relevant Automation Content resources based on permissions.'
    );

    expect(screen.getByTestId('opt-awx.project')).toBeInTheDocument();
    expect(screen.getByTestId('opt-eda.activation')).toBeInTheDocument();
    expect(screen.getByTestId('opt-galaxy.namespace')).toBeInTheDocument();
    expect(screen.getByTestId('opt-custom.other')).toBeInTheDocument();
    expect(screen.getByTestId('opt-.leading-dot')).toBeInTheDocument();
    expect(screen.getByTestId('opt-nodotservice')).toBeInTheDocument();

    expect(screen.queryByTestId('opt-shared.team')).not.toBeInTheDocument();
    expect(screen.queryByTestId('opt-eda.blocked')).not.toBeInTheDocument();
    expect(screen.queryByTestId('opt-galaxy.badtype')).not.toBeInTheDocument();
  });

  it('uses the provided name prop', () => {
    render(
      <Wrapper>
        <PageFormRoleTypeSelect name="my_resource_field" />
      </Wrapper>
    );

    expect(screen.getByTestId('field-name')).toHaveTextContent('my_resource_field');
  });
});
