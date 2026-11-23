import { describe, expect, it } from 'vitest';
import { findDocumentationFile } from './documentationFiles';

describe('findDocumentationFile', () => {
  it('selects the collection changelog when a role changelog with the same prefix comes first', () => {
    const documentationFiles = [
      {
        name: 'CHANGELOG_auditd.md',
        html: '<h1>Auditd role changelog</h1>',
      },
      {
        name: 'CHANGELOG.md',
        html: '<h1>Collection changelog</h1>',
      },
    ];

    expect(findDocumentationFile(documentationFiles, 'CHANGELOG')?.html).toBe(
      '<h1>Collection changelog</h1>'
    );
    expect(findDocumentationFile(documentationFiles, 'CHANGELOG_auditd')?.html).toBe(
      '<h1>Auditd role changelog</h1>'
    );
  });
});
