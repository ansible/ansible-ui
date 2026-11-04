import { SharedContentType } from '@ansible/common-ui/access/roles/SharedContentType';
import { describe, expect, it } from 'vitest';
import { AwxContentType } from './AwxContentType';

describe('AwxContentType', () => {
  it('maps AWX resource types and shared organization/team types', () => {
    expect(AwxContentType.Credential).toBe('awx.credential');
    expect(AwxContentType.Organization).toBe(SharedContentType.Organization);
    expect(AwxContentType.Team).toBe(SharedContentType.Team);
  });
});
