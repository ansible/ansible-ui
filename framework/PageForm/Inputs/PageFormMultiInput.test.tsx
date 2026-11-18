import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';
import { PageFormMultiInput } from './PageFormMultiInput';

vi.mock('../../useFrameworkTranslations', () => ({
  useFrameworkTranslations: () => [{ showLess: 'Show less', countMore: '{count} more' }],
}));

type Item = { id: number; name: string };
type FormValues = { items: Item[] };

function Wrapper(
  props: Partial<React.ComponentProps<typeof PageFormMultiInput<Item, FormValues, 'items'>>> & {
    defaultValues?: FormValues;
  }
) {
  const { defaultValues = { items: [] }, ...inputProps } = props;
  const methods = useForm<FormValues>({ defaultValues, mode: 'onChange' });
  return (
    <FormProvider {...methods}>
      <PageFormMultiInput<Item, FormValues, 'items'>
        name="items"
        label="Items"
        placeholder="Select items"
        getChipLabel={(item) => item.name}
        {...inputProps}
      />
    </FormProvider>
  );
}

describe('PageFormMultiInput', () => {
  it('shows placeholder input when the value is empty', () => {
    render(<Wrapper />);
    expect(screen.getByPlaceholderText('Select items')).toBeInTheDocument();
  });

  it('renders chips for selected items', () => {
    render(
      <Wrapper
        defaultValues={{
          items: [
            { id: 1, name: 'Alpha' },
            { id: 2, name: 'Beta' },
          ],
        }}
      />
    );
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });

  it('removes a chip when the user closes it', async () => {
    const user = userEvent.setup();
    render(
      <Wrapper
        defaultValues={{
          items: [
            { id: 1, name: 'Alpha' },
            { id: 2, name: 'Beta' },
          ],
        }}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Close Alpha' }));
    await waitFor(() => {
      expect(screen.queryByText('Alpha')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });

  it('opens the select dialog and applies the selection callback', async () => {
    const user = userEvent.setup();
    const selectOpen = vi.fn((callback: (items: Item[]) => void) => {
      callback([
        { id: 3, name: 'Gamma' },
        { id: 4, name: 'Delta' },
      ]);
    });

    render(<Wrapper selectTitle="Pick items" selectOpen={selectOpen} />);
    await user.click(screen.getByRole('button', { name: 'Options menu' }));

    expect(selectOpen).toHaveBeenCalledWith(expect.any(Function), 'Pick items');
    await waitFor(() => {
      expect(screen.getByText('Gamma')).toBeInTheDocument();
      expect(screen.getByText('Delta')).toBeInTheDocument();
    });
  });

  it('disables the options button when isDisabled is true', () => {
    render(<Wrapper selectTitle="Pick items" selectOpen={vi.fn()} isDisabled />);
    expect(screen.getByRole('button', { name: 'Options menu' })).toBeDisabled();
  });
});
