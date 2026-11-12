import { render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AuthenticatorTypeEnum } from '../../../interfaces/Authenticator';
import { PageFormAutoMigrateUsersSelect } from './PageFormAutoMigrateUsersSelect';
import { AuthenticatorFormValues } from './AuthenticatorForm';

vi.mock('@ansible/awx-ui/common/PageFormSingleSelectAwxResource', () => ({
  PageFormSingleSelectAwxResource: (props: { label: string }) => (
    <div data-testid="single-migrate">{props.label}</div>
  ),
}));

vi.mock('@ansible/awx-ui/common/PageFormMultiSelectAwxResource', () => ({
  PageFormMultiSelectAwxResource: (props: {
    label: string;
    compareOptionValues?: (a: { id: number }, b: { id: number }) => boolean;
  }) => (
    <div data-testid="multi-migrate">
      {props.label}
      <span data-testid="compare-result">
        {String(props.compareOptionValues?.({ id: 1 }, { id: 1 }) ?? 'no-fn')}
      </span>
    </div>
  ),
}));

function Wrapper(props: Readonly<{ isLegacy: boolean }>) {
  const methods = useForm<AuthenticatorFormValues>({
    defaultValues: {
      name: '',
      enabled: false,
      create_objects: false,
      remove_users: false,
      configuration: {},
      type: AuthenticatorTypeEnum.Local,
      auto_migrate_users_to: null,
    },
  });
  return (
    <MemoryRouter>
      <FormProvider {...methods}>
        <PageFormAutoMigrateUsersSelect isLegacy={props.isLegacy} />
      </FormProvider>
    </MemoryRouter>
  );
}

describe('PageFormAutoMigrateUsersSelect', () => {
  it('uses single-select and migrate-to copy for legacy authenticators', () => {
    render(<Wrapper isLegacy />);
    expect(screen.getByTestId('single-migrate')).toHaveTextContent('Auto migrate users to');
  });

  it('uses multi-select, migrate-from copy, and id-based compare for non-legacy', () => {
    render(<Wrapper isLegacy={false} />);
    expect(screen.getByTestId('multi-migrate')).toHaveTextContent('Auto migrate users from');
    expect(screen.getByTestId('compare-result')).toHaveTextContent('true');
  });
});
