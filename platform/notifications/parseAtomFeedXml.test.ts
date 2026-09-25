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

  test('parses multiple entries into an array', () => {
    const xml = `<feed>
      <entry><id>a</id><title>A</title><updated>2024-01-01T00:00:00Z</updated></entry>
      <entry><id>b</id><title>B</title><updated>2024-01-02T00:00:00Z</updated></entry>
    </feed>`;

    const { feed } = parseAtomFeedXml(xml);
    const entries = feed.entry as XmlNode[];
    expect(entries).toHaveLength(2);
    expect(entries[0].id).toBe('a');
    expect(entries[1].id).toBe('b');
  });

  test('parses link alternate href for notifications', () => {
    const xml = `<feed xmlns:aap="https://example.com/aap"><entry>
      <id>n1</id><title>T</title><updated>2024-01-01T00:00:00Z</updated>
      <link rel="alternate" href="https://example.com/post"/>
      <aap:notification><aap:deployment_type>standalone</aap:deployment_type></aap:notification>
    </entry></feed>`;

    const { feed } = parseAtomFeedXml(xml);
    const entry = feed.entry as XmlNode;
    const link = entry.link as XmlNode;
    expect(link.$?.rel).toBe('alternate');
    expect(link.$?.href).toBe('https://example.com/post');
  });

  test('collapses repeated deployment_type elements into an array', () => {
    const xml = `<feed xmlns:aap="https://example.com/aap"><entry>
      <id>n1</id><title>T</title><updated>2024-01-01T00:00:00Z</updated>
      <aap:notification>
        <aap:deployment_type>standalone</aap:deployment_type>
        <aap:deployment_type>cloud</aap:deployment_type>
      </aap:notification>
    </entry></feed>`;

    const { feed } = parseAtomFeedXml(xml);
    const entry = feed.entry as XmlNode;
    const aap = entry['aap:notification'] as Record<string, unknown>;
    expect(aap['aap:deployment_type']).toEqual(['standalone', 'cloud']);
  });

  test('throws on invalid XML', () => {
    expect(() => parseAtomFeedXml('<feed><entry></feed>')).toThrow('Invalid XML');
  });

  test('parses feed metadata and nested child elements', () => {
    const xml = `<feed>
      <title>My Feed</title>
      <subtitle type="html">Feed summary</subtitle>
      <entry><id>1</id><title>E</title><updated>2024-01-01T00:00:00Z</updated></entry>
    </feed>`;

    const { feed } = parseAtomFeedXml(xml);
    expect(feed.title).toBe('My Feed');
    const subtitle = feed.subtitle as XmlNode;
    expect(subtitle.$?.type).toBe('html');
    expect(subtitle._).toBe('Feed summary');
  });

  test('collapses three or more sibling tags into an array', () => {
    const xml = `<feed>
      <entry>
        <id>n1</id>
        <title>T</title>
        <updated>2024-01-01T00:00:00Z</updated>
        <category>one</category>
        <category>two</category>
        <category>three</category>
      </entry>
    </feed>`;

    const { feed } = parseAtomFeedXml(xml);
    const entry = feed.entry as XmlNode;
    expect(entry.category).toEqual(['one', 'two', 'three']);
  });

  test('parses notification children when the third duplicate becomes an array', () => {
    const xml = `<feed xmlns:aap="https://example.com/aap"><entry>
      <id>n1</id><title>T</title><updated>2024-01-01T00:00:00Z</updated>
      <aap:notification>
        <aap:tag>a</aap:tag>
        <aap:tag>b</aap:tag>
        <aap:tag>c</aap:tag>
      </aap:notification>
    </entry></feed>`;

    const { feed } = parseAtomFeedXml(xml);
    const entry = feed.entry as XmlNode;
    const aap = entry['aap:notification'] as Record<string, unknown>;
    expect(aap['aap:tag']).toEqual(['a', 'b', 'c']);
  });

  test('uses documentElement when no feed tag is present', () => {
    const xml = `<rss><channel><title>Channel</title></channel></rss>`;
    const { feed } = parseAtomFeedXml(xml);
    expect((feed.channel as XmlNode).title).toBe('Channel');
  });
});

type XmlNode = import('./parseAtomFeedXml').XmlNode;
