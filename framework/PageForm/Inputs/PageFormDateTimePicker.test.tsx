import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it } from 'vitest';
import { PageFormDateTimePicker } from './PageFormDateTimePicker';

type FormValues = { schedule: { date?: string; time?: string } };

function Wrapper() {
  const methods = useForm<FormValues>({
    defaultValues: { schedule: { date: '2024-01-01', time: '08:00' } },
  });
  return (
    <FormProvider {...methods}>
      <PageFormDateTimePicker name="schedule" label="Schedule" />
    </FormProvider>
  );
}

describe('PageFormDateTimePicker', () => {
  it('updates date and time in the nested field', async () => {
    const user = userEvent.setup();
    render(<Wrapper />);

    const dateInput = screen.getByDisplayValue('2024-01-01');
    await user.clear(dateInput);
    await user.type(dateInput, '2024-12-01');
    expect(dateInput).toHaveValue('2024-12-01');

    const timeInput = screen.getByDisplayValue('08:00');
    await user.clear(timeInput);
    await user.type(timeInput, '09:15');
    expect(timeInput).toHaveValue('09:15');
  });
});
