export interface XmlNode {
  $?: { [key: string]: string };
  _?: string;
  [key: string]: XmlNode | XmlNode[] | string | { [key: string]: string } | undefined;
}

function attributesToRecord(element: Element): { [key: string]: string } | undefined {
  if (!element.attributes.length) {
    return undefined;
  }
  const record: { [key: string]: string } = {};
  for (const attr of Array.from(element.attributes)) {
    record[attr.name] = attr.value;
  }
  return record;
}

function assignChild(
  node: XmlNode,
  key: string,
  value: XmlNode | XmlNode[] | string | Record<string, unknown>
): void {
  const existing = node[key];
  if (existing === undefined) {
    node[key] = value as XmlNode | XmlNode[] | string;
    return;
  }
  if (Array.isArray(existing)) {
    (existing as Array<XmlNode | string>).push(value as XmlNode | string);
    return;
  }
  node[key] = [existing as XmlNode | string, value as XmlNode | string];
}

function parseAapNotification(element: Element): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const child of Array.from(element.children)) {
    const key = child.tagName;
    const text = (child.textContent ?? '').trim();
    const current = result[key];
    if (current === undefined) {
      result[key] = text;
    } else if (Array.isArray(current)) {
      current.push(text);
    } else {
      result[key] = [current, text];
    }
  }
  return result;
}

function parseElementValue(element: Element): XmlNode | string | Record<string, unknown> {
  if (element.tagName === 'aap:notification' || element.localName === 'notification') {
    return parseAapNotification(element);
  }

  const childElements = Array.from(element.children);
  if (childElements.length === 0) {
    const attributes = attributesToRecord(element);
    const text = (element.textContent ?? '').trim();
    if (attributes) {
      return { $: attributes, _: text || undefined };
    }
    return text;
  }

  const node: XmlNode = { $: attributesToRecord(element), _: undefined };
  for (const child of childElements) {
    assignChild(node, child.tagName, parseElementValue(child));
  }
  return node;
}

function parseEntryElement(entry: Element): XmlNode {
  const node: XmlNode = { $: attributesToRecord(entry), _: undefined };
  for (const child of Array.from(entry.children)) {
    assignChild(node, child.tagName, parseElementValue(child));
  }
  return node;
}

/**
 * Parse an Atom/RSS-style feed into the shape previously produced by xml2js
 * (`explicitArray: false`, `trim: true`).
 */
export function parseAtomFeedXml(feedContent: string): { feed: XmlNode } {
  const doc = new DOMParser().parseFromString(feedContent, 'application/xml');
  if (doc.querySelector('parsererror')) {
    throw new Error('Invalid XML');
  }

  const feedElement = doc.getElementsByTagName('feed')[0] ?? doc.documentElement;
  const feed: XmlNode = { $: attributesToRecord(feedElement), _: undefined };

  for (const child of Array.from(feedElement.children)) {
    if (child.tagName === 'entry') {
      assignChild(feed, 'entry', parseEntryElement(child));
    } else {
      assignChild(feed, child.tagName, parseElementValue(child));
    }
  }

  return { feed };
}
