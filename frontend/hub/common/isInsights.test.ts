import { PageActionSelection, PageActionType } from '@ansible/ansible-ui-framework';
import type { IPageAction } from '@ansible/ansible-ui-framework';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('isInsightsMode', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return true when IS_INSIGHTS is boolean true', async () => {
    process.env.IS_INSIGHTS = true as unknown as string;
    const { isInsightsMode } = await import('./isInsights');

    expect(isInsightsMode()).toBe(true);
  });

  it('should return true when IS_INSIGHTS is string "true"', async () => {
    process.env.IS_INSIGHTS = 'true';
    const { isInsightsMode } = await import('./isInsights');

    expect(isInsightsMode()).toBe(true);
  });

  it('should return false when IS_INSIGHTS is undefined', async () => {
    delete process.env.IS_INSIGHTS;
    const { isInsightsMode } = await import('./isInsights');

    expect(isInsightsMode()).toBe(false);
  });

  it('should return false when IS_INSIGHTS is false', async () => {
    process.env.IS_INSIGHTS = false as unknown as string;
    const { isInsightsMode } = await import('./isInsights');

    expect(isInsightsMode()).toBe(false);
  });

  it('should return false when IS_INSIGHTS is string "false"', async () => {
    process.env.IS_INSIGHTS = 'false';
    const { isInsightsMode } = await import('./isInsights');

    expect(isInsightsMode()).toBe(false);
  });
});

describe('filterInsightsBulkActions', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  const mockActions: IPageAction<{ id: string }>[] = [
    {
      type: PageActionType.Button,
      selection: PageActionSelection.None,
      label: 'Create item',
      onClick: () => {},
    },
    {
      type: PageActionType.Button,
      selection: PageActionSelection.Multiple,
      label: 'Delete selected',
      onClick: () => {},
    },
    {
      type: PageActionType.Button,
      selection: PageActionSelection.Single,
      label: 'Edit item',
      onClick: () => {},
    },
    {
      type: PageActionType.Button,
      selection: PageActionSelection.Multiple,
      label: 'Sign selected',
      onClick: () => {},
    },
  ];

  it('should return all actions when not in Insights mode', async () => {
    delete process.env.IS_INSIGHTS;
    const { filterInsightsBulkActions } = await import('./isInsights');

    const result = filterInsightsBulkActions(mockActions);

    expect(result).toHaveLength(4);
    expect(result).toEqual(mockActions);
  });

  it('should filter out Multiple selection actions in Insights mode', async () => {
    process.env.IS_INSIGHTS = 'true';
    const { filterInsightsBulkActions } = await import('./isInsights');

    const result = filterInsightsBulkActions(mockActions);

    expect(result).toHaveLength(2);
    expect(result.map((a) => ('label' in a ? a.label : ''))).toEqual(['Create item', 'Edit item']);
  });

  it('should keep None and Single selection actions in Insights mode', async () => {
    process.env.IS_INSIGHTS = 'true';
    const { filterInsightsBulkActions } = await import('./isInsights');

    const result = filterInsightsBulkActions(mockActions);

    result.forEach((action) => {
      if ('selection' in action) {
        expect(action.selection).not.toBe(PageActionSelection.Multiple);
      }
    });
  });

  it('should return empty array when all actions are bulk and in Insights mode', async () => {
    process.env.IS_INSIGHTS = 'true';
    const { filterInsightsBulkActions } = await import('./isInsights');

    const bulkOnly: IPageAction<{ id: string }>[] = [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        label: 'Bulk action 1',
        onClick: () => {},
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        label: 'Bulk action 2',
        onClick: () => {},
      },
    ];

    expect(filterInsightsBulkActions(bulkOnly)).toHaveLength(0);
  });

  it('should handle empty actions array', async () => {
    process.env.IS_INSIGHTS = 'true';
    const { filterInsightsBulkActions } = await import('./isInsights');

    expect(filterInsightsBulkActions([])).toEqual([]);
  });

  it('should keep separator actions that have no selection property', async () => {
    process.env.IS_INSIGHTS = 'true';
    const { filterInsightsBulkActions } = await import('./isInsights');

    const actionsWithSeparator: IPageAction<{ id: string }>[] = [
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        label: 'Create item',
        onClick: () => {},
      },
    ];

    const result = filterInsightsBulkActions(actionsWithSeparator);
    expect(result).toHaveLength(2);
  });
});
