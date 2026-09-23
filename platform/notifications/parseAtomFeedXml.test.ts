import { describe, expect, test } from 'vitest';
import { parseAtomFeedXml } from './parseAtomFeedXml';

describe('parseAtomFeedXml', () => {
  test('parses a single feed entry', () => {
    const xml = `<?xml version="1.0"?>
<feed xmlns:aap="https://example.com/aap">
  <entry>
    <id>notification-1</id>
    <title>Test Notification</title>
    <content>Test description</content>
    <updated>2024-01-01T00:00:00Z</updated>
    <aap:notification>
      <aap:title>AAP Notification Title</aap:title>
      <aap:deployment_type>standalone</aap:deployment_type>
    </aap:notification>
  </entry>
</feed>`;

    const { feed } = parseAtomFeedXml(xml);
    const entry = feed.entry as XmlNode;
    expect(entry.id).toBe('notification-1');
    expect(entry.title).toBe('Test Notification');
    expect(entry.content).toBe('Test description');
    expect((entry['aap:notification'] as Record<string, string>)['aap:title']).toBe(
      'AAP Notification Title'
    );
  });

  test('throws on invalid XML', () => {
    expect(() => parseAtomFeedXml('<feed><entry></feed>')).toThrow('Invalid XML');
  });
});

type XmlNode = import('./parseAtomFeedXml').XmlNode;
