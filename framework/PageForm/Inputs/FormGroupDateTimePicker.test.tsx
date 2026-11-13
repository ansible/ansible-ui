import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import type { TimePickerProps } from '@patternfly/react-core';
import { FormGroupDateTimePicker } from './FormGroupDateTimePicker';
import type { FormGroupDateTimePickerProps } from './FormGroupDateTimePicker';

vi.mock('@patternfly/react-core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@patternfly/react-core')>();
  return {
    ...actual,
    DatePicker: ({ placeholder, value }: { placeholder?: string; value?: string }) => (
      <input aria-label="Date picker" placeholder={placeholder} value={value ?? ''} readOnly />
    ),
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
