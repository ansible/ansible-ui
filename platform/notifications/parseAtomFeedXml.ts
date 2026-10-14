export interface XmlNode {
  $?: { [key: string]: string };
  _?: string;
  [key: string]: XmlNode | XmlNode[] | string | { [key: string]: string | string[] } | undefined;
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

function directText(element: Element): string | undefined {
  const text = Array.from(element.childNodes)
    .filter((child) => child.nodeType === Node.TEXT_NODE)
    .map((child) => child.nodeValue ?? '')
    .join('')
    .trim();
  return text || undefined;
}

function childKey(element: Element): string {
  return element.namespaceURI === 'http://www.w3.org/2005/Atom'
    ? element.localName
    : element.tagName;
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
  node[key] = [existing as XmlNode | string, value as XmlNode | string] as unknown as XmlNode[];
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

  const node: XmlNode = { $: attributesToRecord(element), _: directText(element) };
  for (const child of childElements) {
    assignChild(node, childKey(child), parseElementValue(child));
  }
  return node;
}

function parseEntryElement(entry: Element): XmlNode {
  const node: XmlNode = { $: attributesToRecord(entry), _: directText(entry) };
  for (const child of Array.from(entry.children)) {
    assignChild(node, childKey(child), parseElementValue(child));
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

  const feedElement =
    Array.from(doc.getElementsByTagName('*')).find((element) => element.localName === 'feed') ??
    doc.documentElement;
  const feed: XmlNode = { $: attributesToRecord(feedElement), _: directText(feedElement) };

  for (const child of Array.from(feedElement.children)) {
    if (child.localName === 'entry') {
      assignChild(feed, 'entry', parseEntryElement(child));
    } else {
      assignChild(feed, childKey(child), parseElementValue(child));
    }
  }

  return { feed };
}
