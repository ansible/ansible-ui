/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  formattedValue,
  getClickableText,
  getDateFormatByGranularity,
  isAvgDuration,
  isNoName,
  isOther,
  formatTotalTime,
  paths,
  renderAllTasksStatus,
  DEFAULT_NAMESPACE,
} from './AnalyticsReportBuilderUtils';

describe('AnalyticsReportBuilderUtils', () => {
  it('formats values by metric key', () => {
    expect(formattedValue('elapsed', 1.234)).toBe('1.23 seconds');
    expect(formattedValue('template_automation_percentage', 12.3)).toBe('12.30%');
    expect(formattedValue('monetary_gain', 10)).toMatch(/\$/);
    expect(formattedValue('runs', 2)).toBe('2.00');
  });

  it('maps granularity to axis format helpers', () => {
    expect(getDateFormatByGranularity('yearly')).toBe('formatAsYear');
    expect(getDateFormatByGranularity('monthly')).toBe('formatAsMonth');
    expect(getDateFormatByGranularity('daily')).toBe('formatDateAsDayMonth');
    expect(getDateFormatByGranularity('weekly')).toBe('');
  });

  it('detects special row identifiers', () => {
    expect(isOther({ id: -1 }, 'id')).toBe(true);
    expect(isNoName({ id: -2 }, 'id')).toBe(true);
    expect(isAvgDuration({}, 'average_duration_per_task')).toBe(true);
  });

  it('formats elapsed seconds as HH:MM:SS', () => {
    expect(formatTotalTime(3661)).toBe('01:01:01');
  });

  it('builds detail paths from slug', () => {
    expect(paths.getDetails('roi')).toBe('roi');
  });

  it('renders dash for other and missing name rows', () => {
    expect(getClickableText({ id: -1, name: 'x' }, 'id', {} as never)).toBe('-');
    expect(getClickableText({ id: -2, name: 'x' }, 'id', {} as never)).toBe('-');
  });

  it('renders a link for module usage counts', async () => {
    const navigate = vi.fn();
    const user = userEvent.setup();
    render(
      <>
        {getClickableText({ id: 5, name: 'copy', host_task_count: 3 }, 'host_task_count', {
          navigate,
        } as never)}
      </>
    );

    await user.click(screen.getByRole('button', { name: '3' }));
    expect(navigate).toHaveBeenCalledWith('TestAnalyticsBuilder', {
      query: {
        reportName: 'module_usage_by_task',
        task_action_id: [5],
      },
    });
  });

  it('renders expanded row content for most_used_modules', () => {
    const row = renderAllTasksStatus({ id: 1 }, { report_name: 'most_used_modules' } as never);
    expect(row).toBeDefined();
  });

  it('exposes default namespace constant', () => {
    expect(DEFAULT_NAMESPACE).toBe('default');
  });
});
