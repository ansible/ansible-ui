import { describe, expect, it } from 'vitest';
import type { WorkflowNode } from '../../../../interfaces/WorkflowNode';
import { mergeNodeOriginalResources } from './mergeNodeOriginalResources';

const resource = {
  summary_fields: {
    unified_job_template: { id: 2 },
  },
} as WorkflowNode;

describe('mergeNodeOriginalResources', () => {
  it('returns undefined when both snapshots are empty', () => {
    expect(mergeNodeOriginalResources(undefined, undefined, resource)).toBeUndefined();
  });

  it('preserves freshly fetched associations while merging reconciled fields', () => {
    const merged = mergeNodeOriginalResources(
      {
        template_id: 2,
        credentials: [{ id: 7, name: 'Fresh credential', credential_type: 1 }],
        isTemplateChange: true,
      },
      {
        template_id: 2,
        extra_data: { persisted: 'value' },
        credentials: [],
        isTemplateChange: true,
      },
      resource
    );

    expect(merged).toMatchObject({
      template_id: 2,
      extra_data: { persisted: 'value' },
      credentials: [{ id: 7, name: 'Fresh credential' }],
    });
    expect(merged?.isTemplateChange).toBeUndefined();
  });

  it('drops stale template-change flag when node matches original template', () => {
    const merged = mergeNodeOriginalResources(
      { template_id: 2, isTemplateChange: true },
      { template_id: 2, isTemplateChange: true },
      resource
    );

    expect(merged).toEqual({ template_id: 2 });
  });
});
