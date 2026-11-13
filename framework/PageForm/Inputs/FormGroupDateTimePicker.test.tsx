import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FormGroupDateTimePicker } from './FormGroupDateTimePicker';

describe('FormGroupDateTimePicker', () => {
  it('propagates date and time changes', async () => {
    const user = userEvent.setup();
    const onDateChange = vi.fn();
    const onTimeChange = vi.fn();

    render(
      <FormGroupDateTimePicker
        id="schedule"
        label="Schedule"
        dateValue=""
        timeValue=""
        onDateChange={onDateChange}
        onTimeChange={onTimeChange}
        datePlaceHolder="YYYY-MM-DD"
        timePlaceHolder="HH:MM"
      />
    );

    await user.type(screen.getByPlaceholderText('YYYY-MM-DD'), '2024-06-15');
    expect(onDateChange).toHaveBeenCalledWith('2024-06-15');

    await user.type(screen.getByPlaceholderText('HH:MM'), '10:30');
    expect(onTimeChange).toHaveBeenCalled();
  });
});
