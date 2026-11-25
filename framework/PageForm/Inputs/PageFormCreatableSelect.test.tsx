/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it } from 'vitest';
import { PageFormCreatableSelect } from './PageFormCreatableSelect';

const options = [
  { value: 'alpha', label: 'Alpha' },
  { value: 'beta', label: 'Beta' },
];

function MultiCreatableHarness() {
  const methods = useForm({
    defaultValues: { teams: [{ name: 'Alpha' }] as { name: string }[] },
  });
  return (
    <FormProvider {...methods}>
      <PageFormCreatableSelect
        name="teams"
        label="Teams"
        options={options}
        placeholderText="Search teams"
      />
    </FormProvider>
  );
}

function SingleCreatableHarness() {
  const methods = useForm({ defaultValues: { team: null as { name: string } | null } });
  return (
    <FormProvider {...methods}>
      <PageFormCreatableSelect
        name="team"
        label="Team"
        options={options}
        isMulti={false}
        placeholderText="Search team"
      />
    </FormProvider>
  );
}

describe('PageFormCreatableSelect', () => {
  it('renders multi-select creatable field with existing value', () => {
    render(<MultiCreatableHarness />);
    expect(screen.getByText('Teams')).toBeInTheDocument();
    expect(screen.getByTestId('selected-chip')).toHaveTextContent('Alpha');
  });

  it('selects another team in multi mode', async () => {
    const user = userEvent.setup();
    render(<MultiCreatableHarness />);

    const input = screen.getByRole('textbox');
    await user.click(input);
    await user.type(input, 'Beta');
    await user.keyboard('{Enter}');

    expect(screen.getAllByTestId('selected-chip')).toHaveLength(2);
  });

  it('selects a value in single-select mode', async () => {
    const user = userEvent.setup();
    render(<SingleCreatableHarness />);

    const input = screen.getByRole('textbox');
    await user.click(input);
    await user.type(input, 'Beta');
    await user.keyboard('{Enter}');

    expect(input).toHaveValue('Beta');
  });

  it('updates single-select when another option is chosen', async () => {
    const user = userEvent.setup();
    function Harness() {
      const methods = useForm({ defaultValues: { team: { name: 'Alpha' } as { name: string } } });
      return (
        <FormProvider {...methods}>
          <PageFormCreatableSelect name="team" label="Team" options={options} isMulti={false} />
        </FormProvider>
      );
    }

    render(<Harness />);
    const input = screen.getByRole('textbox');
    await user.click(input);
    await user.clear(input);
    await user.type(input, 'Beta');
    await user.click(screen.getByText('Beta'));
    expect(input).toHaveValue('Beta');
  });

  it('clears single-select through the clear control', async () => {
    const user = userEvent.setup();
    function SingleWithValueHarness() {
      const methods = useForm({ defaultValues: { team: { name: 'Alpha' } as { name: string } } });
      return (
        <FormProvider {...methods}>
          <PageFormCreatableSelect name="team" label="Team" options={options} isMulti={false} />
        </FormProvider>
      );
    }

    render(<SingleWithValueHarness />);
    await user.click(screen.getByRole('button', { name: 'Clear input value' }));
    expect(screen.getByRole('textbox')).toHaveValue('');
  });

  it('removes a chip through onHandleClear', async () => {
    const user = userEvent.setup();
    render(<MultiCreatableHarness />);

    const chip = screen.getByTestId('selected-chip');
    await user.click(chip.querySelector('button')!);
    expect(screen.queryByTestId('selected-chip')).not.toBeInTheDocument();
  });

  it('renders with shouldUnregister disabled', () => {
    function Harness() {
      const methods = useForm({ defaultValues: { teams: [] as { name: string }[] } });
      return (
        <FormProvider {...methods}>
          <PageFormCreatableSelect
            name="teams"
            label="Teams"
            options={options}
            shouldUnregister={false}
          />
        </FormProvider>
      );
    }

    render(<Harness />);
    expect(screen.getByText('Teams')).toBeInTheDocument();
  });
});
