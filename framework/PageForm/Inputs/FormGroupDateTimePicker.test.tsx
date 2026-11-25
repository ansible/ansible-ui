import type { TimePickerProps } from '@patternfly/react-core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  FormGroupDateTimePicker,
  type FormGroupDateTimePickerProps,
} from './FormGroupDateTimePicker';

vi.mock('@patternfly/react-core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@patternfly/react-core')>();
  return {
    ...actual,
    TimePicker: ({
      inputProps,
      onChange,
      placeholder,
      time,
    }: {
      inputProps?: { value?: string };
      onChange?: TimePickerProps['onChange'];
      placeholder?: string;
      time?: string;
    }) => (
      <input
        aria-label="Time picker"
        placeholder={placeholder}
        value={inputProps?.value ?? time ?? ''}
        onChange={(event) => onChange?.(event, event.currentTarget.value)}
      />
    ),
  };
});

function ControlledDateTimePicker({
  onTimeChange,
}: {
  onTimeChange: FormGroupDateTimePickerProps['onTimeChange'];
}) {
  const [timeValue, setTimeValue] = useState('8:00 AM');

  return (
    <FormGroupDateTimePicker
      id="startDateTime"
      label="Start date/time"
      dateValue="2026-11-13"
      datePlaceHolder="Date picker"
      timeValue={timeValue}
      timePlaceHolder="Time picker"
      onDateChange={vi.fn()}
      onTimeChange={(event, time, hour, minute, seconds, isValid) => {
        onTimeChange(event, time, hour, minute, seconds, isValid);
        setTimeValue(time);
      }}
    />
  );
}

describe('FormGroupDateTimePicker', () => {
  it('propagates date and time changes', async () => {
    const user = userEvent.setup();
    const onDateChange = vi.fn();
    const onTimeChange = vi.fn<NonNullable<TimePickerProps['onChange']>>();

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

  it('forwards the selected time to onTimeChange', async () => {
    const user = userEvent.setup({ delay: null });
    const onTimeChange = vi.fn<FormGroupDateTimePickerProps['onTimeChange']>();

    render(<ControlledDateTimePicker onTimeChange={onTimeChange} />);

    const timePicker = screen.getByRole('textbox', { name: 'Time picker' });
    await user.clear(timePicker);
    await user.type(timePicker, '1:00 PM');

    expect(onTimeChange).toHaveBeenCalled();
    expect(onTimeChange.mock.calls.at(-1)?.[1]).toBe('1:00 PM');
  });
});
