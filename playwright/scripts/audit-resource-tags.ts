#!/usr/bin/env tsx
/* eslint-disable no-console */
/**
 * Audit resource-tag coverage for Playwright integration tests.
 *
 * Tags inherited from test.describe(..., { tag: [...] }, () => { ... }) count
 * for every nested test. A test may carry any number of resource tags.
 *
 * Usage:
 *   npm run tag-audit -- --mapping /path/to/mapping.json
 *   npm run tag-audit -- --output /tmp/tag-audit.json --fail-on-missing
 */

import fs from 'node:fs';
import path from 'node:path';
import * as ts from 'typescript';

type Scope = { start: number; end: number; tags: Set<string> };
type Candidate = { tag: string; confidence: 'high' | 'review'; evidence: string };
type TestRecord = {
  file: string;
  line: number;
  tags: string[];
  candidates: Candidate[];
  auditable: boolean;
  dynamic: boolean;
};
type Mapping = {
  repos?: Record<string, { resources?: Record<string, { tests?: string[] }> }>;
};

const args = process.argv.slice(2);
const arg = (name: string): string | undefined => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};
const root = path.resolve(import.meta.dirname, '..');
const testsRoot = path.join(root, 'tests', 'integration');
const mappingPath = arg('--mapping');
const outputPath = arg('--output');
const manifestPath = arg('--manifest');
const failOnMissing = args.includes('--fail-on-missing');
const metadataTags = new Set([
  '@not_mock',
  '@mock',
  '@tier1',
  '@tier2',
  '@compare',
  '@local_debug',
  '@not_e2e',
]);
// These tests exercise product-wide UI behavior without a backend resource that
// component PR mapping can safely associate with them. They run in the nightly
// suite, not through resource-based PR selection.
const baselineOnlyTags = new Set(['@platform']);
let mapping: Mapping | undefined;

function usage(): never {
  console.error(
    'Usage: npm run tag-audit -- [--mapping mapping.json] [--output report.json] [--fail-on-missing]'
  );
  process.exit(2);
}

if (args.some((value) => value === '--help' || value === '-h')) usage();

function walk(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    return /\.spec\.tsx?$/.test(entry.name) ? [fullPath] : [];
  });
}

function matchingDelimiter(
  content: string,
  start: number,
  opening: string,
  closing: string
): number {
  let depth = 0;
  let quote: string | undefined;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;
  for (let index = start; index < content.length; index += 1) {
    const char = content[index];
    const next = content[index + 1] ?? '';
    if (lineComment) {
      if (char === '\n') lineComment = false;
      continue;
    }
    if (blockComment) {
      if (char === '*' && next === '/') blockComment = false;
      continue;
    }
    if (quote) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === quote) quote = undefined;
      continue;
    }
    if (char === "'" || char === '"' || char === '`') quote = char;
    else if (char === '/' && next === '/') lineComment = true;
    else if (char === '/' && next === '*') blockComment = true;
    else if (char === opening) depth += 1;
    else if (char === closing) {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return -1;
}

function topLevelCallbackArrow(call: string): number {
  let parens = 0;
  let braces = 0;
  let brackets = 0;
  let quote: string | undefined;
  let escaped = false;
  for (let index = 0; index < call.length - 1; index += 1) {
    const char = call[index];
    const next = call[index + 1];
    if (quote) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === quote) quote = undefined;
      continue;
    }
    if (char === "'" || char === '"' || char === '`') quote = char;
    else if (char === '(') parens += 1;
    else if (char === ')') parens -= 1;
    else if (char === '{') braces += 1;
    else if (char === '}') braces -= 1;
    else if (char === '[') brackets += 1;
    else if (char === ']') brackets -= 1;
    else if (char === '=' && next === '>' && !(parens || braces || brackets)) return index;
  }
  return -1;
}

function tagsIn(text: string, knownTags?: Set<string>): Set<string> {
  // Tags must be present in the source text. In particular, a baseline-only
  // classification must never be inherited implicitly by unrelated tests.
  const tags = new Set<string>();
  for (const found of text.matchAll(/tag:\s*(?:\[([^\]]+)\]|['"]([^'"]+)['"])/g)) {
    const values = found[1] ?? found[2] ?? '';
    for (const tag of values.matchAll(/['"]?(@[A-Za-z][A-Za-z0-9_-]*)['"]?/g)) {
      if (!knownTags || knownTags.has(tag[1])) tags.add(tag[1]);
    }
  }
  return tags;
}

function describeScopes(content: string, knownTags?: Set<string>): Scope[] {
  const scopes: Scope[] = [];
  const source = ts.createSourceFile('spec.ts', content, ts.ScriptTarget.Latest, true);

  const visit = (node: ts.Node): void => {
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      ts.isIdentifier(node.expression.expression) &&
      node.expression.expression.text === 'test' &&
      node.expression.name.text === 'describe'
    ) {
      const callback = node.arguments.find(
        (argument): argument is ts.ArrowFunction | ts.FunctionExpression =>
          ts.isArrowFunction(argument) || ts.isFunctionExpression(argument)
      );
      if (callback && ts.isBlock(callback.body)) {
        const header = node.arguments
          .filter((argument) => argument !== callback)
          .map((argument) => argument.getText(source))
          .join(', ');
        scopes.push({
          start: callback.body.getStart(source),
          end: callback.body.end,
          // Only tags in the describe header are inherited. Tags on nested
          // test calls belong to those tests alone, not their siblings.
          tags: tagsIn(header, knownTags),
        });
      }
    }
    ts.forEachChild(node, visit);
  };

  visit(source);
  return scopes;
}

function lineAt(content: string, index: number): number {
  return content.slice(0, index).split('\n').length;
}

function normalizeResource(value: string): string {
  const normalized = value.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (normalized.endsWith('ies')) return `${normalized.slice(0, -3)}y`;
  return normalized.endsWith('s') ? normalized.slice(0, -1) : normalized;
}

function resourceTag(value: string, knownTags?: Set<string>): string | undefined {
  if (!knownTags) return undefined;
  const normalized = normalizeResource(value);
  return [...knownTags].find((tag) => normalizeResource(tag.slice(1)) === normalized);
}

function callbackBody(content: string, callStart: number, callEnd: number): string {
  const opening = content.indexOf('(', callStart);
  const call = content.slice(opening + 1, callEnd);
  const callback = topLevelCallbackArrow(call);
  if (callback < 0) return '';
  const bodyStart = content.indexOf('{', opening + 1 + callback);
  const bodyEnd = bodyStart >= 0 ? matchingDelimiter(content, bodyStart, '{', '}') : -1;
  return bodyEnd >= 0 ? content.slice(bodyStart, bodyEnd + 1) : '';
}

function utilImports(content: string, knownTags?: Set<string>): Map<string, Candidate> {
  const imports = new Map<string, Candidate>();
  // Split at semicolons first so a non-utility import cannot consume the next
  // import declaration while searching for a utils/ path.
  for (const statement of content.split(';')) {
    const match = statement.match(
      /^\s*import\s+([\s\S]*?)\s+from\s+['"][^'"]*utils\/([^'"]+)['"]\s*$/
    );
    if (!match) continue;
    const resource = resourceTag(path.basename(match[2]).replace(/\.[^.]+$/, ''), knownTags);
    if (!resource) continue;
    const bindings = match[1]
      .replace(/[{}]/g, '')
      .split(',')
      .map((binding) =>
        binding
          .trim()
          .split(/\s+as\s+/)
          .pop()
          ?.trim()
      )
      .filter((binding): binding is string => Boolean(binding));
    for (const binding of bindings) {
      imports.set(binding, {
        tag: resource,
        confidence: 'high',
        evidence: `uses ${binding} from utils/${match[2]}`,
      });
    }
  }
  return imports;
}

function mappedSpecTags(file: string): Set<string> {
  const relative = path.relative(path.dirname(root), file).split(path.sep).join('/');
  const tags = new Set<string>();
  for (const repo of Object.values(mapping?.repos ?? {})) {
    for (const [resource, data] of Object.entries(repo.resources ?? {})) {
      if (data.tests?.includes(relative)) tags.add(`@${resource}`);
    }
  }
  return tags;
}

function candidatesForTest(
  file: string,
  body: string,
  imports: Map<string, Candidate>
): Candidate[] {
  const candidates = new Map<string, Candidate>();
  for (const [binding, candidate] of imports) {
    if (new RegExp(`\\b${binding.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(body)) {
      candidates.set(candidate.tag, candidate);
    }
  }
  for (const tag of mappedSpecTags(file)) {
    if (!candidates.has(tag)) {
      candidates.set(tag, {
        tag,
        confidence: 'review',
        evidence: 'mapping associates this spec with the resource',
      });
    }
  }
  return [...candidates.values()].sort((left, right) => left.tag.localeCompare(right.tag));
}

function dynamicTestDeclarationStarts(content: string): Set<number> {
  const source = ts.createSourceFile('spec.ts', content, ts.ScriptTarget.Latest, true);
  const starts = new Set<number>();
  const dynamicCollectionMethods = new Set(['forEach', 'map', 'flatMap', 'reduce']);
  const isTestDeclaration = (node: ts.CallExpression): boolean => {
    const expression = node.expression.getText(source);
    return /^(?:test|test\.(?:only|skip|fail|fixme|slow))$/.test(expression);
  };
  const isDynamicCollectionCall = (node: ts.Node): node is ts.CallExpression =>
    ts.isCallExpression(node) &&
    ts.isPropertyAccessExpression(node.expression) &&
    dynamicCollectionMethods.has(node.expression.name.text);
  const visit = (node: ts.Node, inDynamicContext: boolean): void => {
    const loop = ts.isForStatement(node) || ts.isForInStatement(node) || ts.isForOfStatement(node);
    const dynamicContext = inDynamicContext || loop;
    if (dynamicContext && ts.isCallExpression(node) && isTestDeclaration(node)) {
      starts.add(node.getStart(source));
    }
    if (isDynamicCollectionCall(node)) {
      // A test declaration in an array iterator is evaluated once for each
      // item. Treat it like a loop even when the iterator spans many lines.
      ts.forEachChild(node.expression, (child) => visit(child, dynamicContext));
      for (const argument of node.arguments) visit(argument, true);
      return;
    }
    ts.forEachChild(node, (child) => visit(child, dynamicContext));
  };
  visit(source, false);
  return starts;
}

function auditFile(file: string, knownTags?: Set<string>): TestRecord[] {
  const content = fs.readFileSync(file, 'utf8');
  const scopes = describeScopes(content, knownTags);
  const imports = utilImports(content, knownTags);
  const dynamicStarts = dynamicTestDeclarationStarts(content);
  const hasTestEach = /\btest\.each\s*\(/.test(content);
  const tests: TestRecord[] = [];
  for (const call of content.matchAll(/\btest(?:\.(?:only|skip|fail|fixme|slow))?\s*\(/g)) {
    const start = call.index ?? 0;
    const close = matchingDelimiter(content, start + call[0].length - 1, '(', ')');
    if (close < 0) {
      tests.push({
        file,
        line: lineAt(content, start),
        tags: [],
        candidates: [],
        auditable: false,
        dynamic: false,
      });
      continue;
    }
    const callArguments = content.slice(start + call[0].length, close).trimStart();
    // A declared Playwright test starts with its literal title. Calls such as
    // `test.skip(condition, reason)` are imperative control flow inside a test
    // body and must not become phantom manifest entries.
    if (!/^(?:'|"|`)/.test(callArguments)) continue;
    const tags = tagsIn(content.slice(start, close + 1), knownTags);
    for (const scope of scopes) {
      if (scope.start < start && start < scope.end) for (const tag of scope.tags) tags.add(tag);
    }
    tests.push({
      file,
      line: lineAt(content, start),
      tags: [...tags].sort(),
      candidates: candidatesForTest(file, callbackBody(content, start, close), imports),
      // A tagged declaration created from a statically analyzable collection
      // is still safely selectable by its inherited resource tag. Preserve that
      // fact in the manifest rather than falsely claiming it is a single static
      // runtime instance. `test.each` remains unparseable at file level.
      auditable: !hasTestEach,
      dynamic: dynamicStarts.has(start),
    });
  }
  // test.each does not expose ordinary `test(...)` declarations for this
  // manifest parser. Emit a synthetic incomplete record so --fail-on-missing
  // cannot silently publish a mapping that omitted those tests.
  if (hasTestEach) {
    tests.push({
      file,
      line: 1,
      tags: [],
      candidates: [],
      auditable: false,
      dynamic: false,
    });
  }
  return tests;
}

function knownResourceTags(): Set<string> | undefined {
  if (!mappingPath) return undefined;
  mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8')) as Mapping;
  // Include baseline-only tags so literal use is recognized by the parser.
  // tagsIn() still starts empty, so these are never assigned implicitly.
  const tags = new Set<string>(baselineOnlyTags);
  for (const repo of Object.values(mapping.repos ?? {})) {
    for (const resource of Object.keys(repo.resources ?? {})) tags.add(`@${resource}`);
  }
  return tags;
}

const knownTags = knownResourceTags();
const records = walk(testsRoot).flatMap((file) => auditFile(file, knownTags));
const coverageTags = (record: TestRecord) => record.tags.filter((tag) => !metadataTags.has(tag));
const resourceTags = (record: TestRecord) =>
  coverageTags(record).filter((tag) => !baselineOnlyTags.has(tag));
const isBaselineOnly = (record: TestRecord) =>
  resourceTags(record).length === 0 && record.tags.some((tag) => baselineOnlyTags.has(tag));
const domains = new Map<string, TestRecord[]>();
for (const record of records) {
  const relative = path.relative(testsRoot, record.file).split(path.sep);
  const domain = relative[0] ?? 'unknown';
  domains.set(domain, [...(domains.get(domain) ?? []), record]);
}
const missing = records.filter((record) => !record.auditable || coverageTags(record).length === 0);
const report = {
  generatedAt: new Date().toISOString(),
  mapping: mappingPath ?? null,
  summary: {
    specs: new Set(records.map((record) => record.file)).size,
    individualTests: records.length,
    fullyTaggedTests: records.length - missing.length,
    resourceTaggedTests: records.filter((record) => resourceTags(record).length > 0).length,
    baselineOnlyTests: records.filter(isBaselineOnly).length,
    missingResourceTags: missing.length,
    dynamicTestTemplates: records.filter((record) => record.dynamic).length,
    unparseableTests: records.filter((record) => !record.auditable).length,
  },
  domains: [...domains.entries()]
    .map(([domain, domainRecords]) => {
      const domainMissing = domainRecords.filter(
        (record) => !record.auditable || coverageTags(record).length === 0
      );
      return {
        domain,
        specs: new Set(domainRecords.map((record) => record.file)).size,
        individualTests: domainRecords.length,
        fullyTaggedTests: domainRecords.length - domainMissing.length,
        resourceTaggedTests: domainRecords.filter((record) => resourceTags(record).length > 0)
          .length,
        baselineOnlyTests: domainRecords.filter(isBaselineOnly).length,
        missingResourceTags: domainMissing.length,
        dynamicTestTemplates: domainRecords.filter((record) => record.dynamic).length,
        missing: domainMissing.map((record) => ({
          file: path.relative(root, record.file),
          line: record.line,
          reason: record.auditable ? 'no-resource-tag' : 'dynamic-or-unparseable',
          candidates: record.candidates,
        })),
      };
    })
    .sort(
      (left, right) =>
        right.missingResourceTags - left.missingResourceTags ||
        left.domain.localeCompare(right.domain)
    ),
};

const rendered = `${JSON.stringify(report, null, 2)}\n`;
if (outputPath) fs.writeFileSync(outputPath, rendered);
if (manifestPath) {
  const manifest = {
    version: '1.0',
    generatedAt: new Date().toISOString(),
    // Dynamic templates are represented explicitly below and remain selectable
    // through their literal tags. Only unparseable declarations make the
    // manifest incomplete.
    parserComplete: records.every((record) => record.auditable),
    tests: records.map((record) => ({
      // The mapping artifact is consumed outside this checkout, so paths must be
      // stable relative to the ansible-ui repository rather than absolute.
      file: path.relative(path.dirname(root), record.file).split(path.sep).join('/'),
      line: record.line,
      resourceTags: resourceTags(record).map((tag) => tag.slice(1)),
      baselineOnly: isBaselineOnly(record),
      dynamic: record.dynamic,
    })),
  };
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}
console.log(rendered);
if (failOnMissing && missing.length > 0) process.exit(1);
