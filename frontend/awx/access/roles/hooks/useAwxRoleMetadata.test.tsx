import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useAwxRoleMetadata } from './useAwxRoleMetadata';

describe('useAwxRoleMetadata', () => {
  it('returns translated metadata for AWX content types', () => {
    const { result } = renderHook(() => useAwxRoleMetadata());
    expect(result.current.content_types['awx.credential'].displayName).toBe('Credential');
    expect(result.current.content_types['awx.project'].permissions['awx.view_project']).toBe(
      'View project'
    );
    expect(
      result.current.content_types['shared.organization'].permissions['shared.member_team']
    ).toBe('Member team');
    expect(result.current.content_types['awx.workflowjobtemplate'].displayName).toBe(
      'Workflow job template'
    );
  });
});
