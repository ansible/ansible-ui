import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DateRange } from './ToolbarDateRangeFilter';

vi.mock('@patternfly/react-core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@patternfly/react-core')>();
  return {
    ...actual,
    DatePicker: ({
      value,
      validators,
      isDisabled,
      'aria-label': ariaLabel,
    }: {
      value?: string;
      validators?: ((date: Date) => string)[];
      isDisabled?: boolean;
      'aria-label'?: string;
    }) => (
      <>
        <input aria-label={ariaLabel} disabled={isDisabled} readOnly value={value ?? ''} />
        <output aria-label={ariaLabel}>
          {validators?.map((validator) => validator(new Date(value ?? '2024-01-02'))).join('')}
        </output>
      </>
    ),
  };
});

describe('DateRange to-date validator', () => {
  function renderValidator(from?: string, to?: string) {
    render(<DateRange from={from} to={to} setFrom={vi.fn()} setTo={vi.fn()} />);
    return screen.getByRole('status', { name: 'End date' }).textContent;
  }

  it.each(['2024-01-02', '2024-01-01'])(
    'allows an end date equal to or after the start date (%s)',
    (from) => expect(renderValidator(from)).toBeFalsy()
  );

  it('rejects an end date before the start date', () => {
    expect(renderValidator('2024-01-03')).toBeTruthy();
  });

  it('does not validate the end date when no start date is set', () => {
    expect(renderValidator()).toBeFalsy();
  });

  it('preserves the validation message when the start date is invalid', () => {
    expect(renderValidator('invalid-date')).toBeTruthy();
  });

  it('rejects an invalid end date when the start date is valid', () => {
    expect(renderValidator('2024-01-01', 'invalid-date')).toBeTruthy();
  });
});
