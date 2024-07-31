import {
  DatePickerProps,
  DatePicker,
  isValidDate,
  yyyyMMddFormat,
  TimePicker,
  TimePickerProps,
  InputGroup,
  InputGroupItem,
} from '@patternfly/react-core';

import React, { FormEvent } from 'react';
import { PageFormGroup, PageFormGroupProps } from './PageFormGroup';
export type FormGroupDateTimePickerProps = Omit<
  DatePickerProps,
  'onChange' | 'placeholder' | 'value'
> &
  Omit<TimePickerProps, 'onChange' | 'placeholder' | 'value'> &
  PageFormGroupProps & {
    onTimeChange: (
      event: React.FormEvent<HTMLInputElement>,
      time: string,
      hour?: number,
      minute?: number,
      seconds?: number,
      isValid?: boolean
    ) => void;
    timePlaceHolder?: string;
    timeValue: string;
    onDateChange: (date: string) => void;
    datePlaceHolder?: string;
    dateValue: string;
  };

export function FormGroupDateTimePicker(props: FormGroupDateTimePickerProps) {
  const { dateValue, timeValue, datePlaceHolder, timePlaceHolder, onDateChange, onTimeChange, id } =
    props;
  const handleDateChange = (
    inputDate: FormEvent<HTMLInputElement>,
    value: string,
    newDate?: Date
  ) => {
    if (!newDate) return;
    if (isValidDate(newDate) && value === yyyyMMddFormat(newDate)) {
      onDateChange(value);
    }
  };
  return (
    <PageFormGroup {...props} fieldId={id}>
      <InputGroup>
        <InputGroupItem>
          <DatePicker
            isDisabled={props.isDisabled}
            placeholder={datePlaceHolder}
            value={dateValue}
            onChange={handleDateChange}
          />
        </InputGroupItem>
        <InputGroupItem>
          <TimePicker
            isDisabled={props.isDisabled}
            placeholder={timePlaceHolder}
            time={timeValue}
            inputProps={{ value: timeValue ?? '' }}
            onChange={onTimeChange}
          />
        </InputGroupItem>
      </InputGroup>
    </PageFormGroup>
  );
}
