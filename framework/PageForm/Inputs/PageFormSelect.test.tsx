/* eslint-disable i18next/no-literal-string */
import { render, within, screen } from '@testing-library/react';
import { PageFormSelect } from './PageFormSelect';
import { describe, expect, test } from 'vitest';
import { useForm, FormProvider } from 'react-hook-form';
import userEvent from '@testing-library/user-event';

describe('PageFormSelect', () => {
  const options = [
    { label: 'Option A', value: 'A' },
    { label: 'Option B', value: 'B' },
    { label: 'Option C', value: 'C' },
  ];
  function Wrapper() {
    const methods = useForm({
      defaultValues: { name: 'A' },
    });

    return (
      <FormProvider {...methods}>
        <form onSubmit={() => methods.handleSubmit(() => {})}>
          <PageFormSelect name="name" label="Name" options={options} />
          <button type="submit">Submit</button>
        </form>
      </FormProvider>
    );
  }
  test('should render select options', async () => {
    const user = userEvent.setup();
    const { container } = render(<Wrapper />);

    await user.click(container.querySelector('button') as HTMLButtonElement);

    const list = await screen.findByRole('listbox');
    expect(list).not.toBeNull();

    for (const option of options) {
      expect(within(list).getByText(option.label)).toBeInTheDocument();
    }
  });

  test('should render scrollable options', async () => {
    const user = userEvent.setup();
    const { container } = render(<Wrapper />);

    await user.click(container.querySelector('button') as HTMLButtonElement);
    const menu = document.querySelector(
      'div.pf-m-scrollable[data-ouia-component-id="menu-select"]'
    );
    expect(menu).toBeInTheDocument();
  });
});
