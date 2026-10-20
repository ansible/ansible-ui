import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { visualPageRegistry } from '../playwright/tests/visual/visualPageRegistry.ts';

const visualRoot = path.resolve(process.argv[2] ?? 'playwright/tests/visual');
const repositoryRoot = path.resolve(visualRoot, '../../..');
const visualProject = 'mock-chromium';
const snapshotDirectories = readdirSync(visualRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && entry.name.endsWith('.spec.ts-snapshots'))
  .map((entry) => entry.name)
  .sort();
const visualSpecs = readdirSync(visualRoot)
  .filter(
    (fileName) =>
      fileName.endsWith('.spec.ts') && statSync(path.join(visualRoot, fileName)).isFile()
  )
  .sort();
const registrySpecs = new Set<string>();
const registryDirectories = new Set<string>();
const expectedBaselines = new Set<string>();
const errors: string[] = [];
let baselineCount = 0;

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

for (const entry of visualPageRegistry) {
  const routeSourcePath = path.join(repositoryRoot, entry.routeSource);
  const registryKey = `${entry.baselineDirectory}/${entry.spec}`;
  if (registrySpecs.has(entry.spec)) errors.push(`${entry.spec}: duplicate registry spec`);
  if (registryDirectories.has(entry.baselineDirectory)) {
    errors.push(`${entry.spec}: duplicate registry baseline directory`);
  }
  registrySpecs.add(entry.spec);
  registryDirectories.add(entry.baselineDirectory);

  if (!entry.routePath.startsWith('/')) errors.push(`${entry.spec}: route path must start with /`);
  if (!visualSpecs.includes(entry.spec)) errors.push(`${entry.spec}: registry spec does not exist`);
  if (!snapshotDirectories.includes(entry.baselineDirectory)) {
    errors.push(`${entry.spec}: registry baseline directory is missing`);
  }
  if (!existsSync(routeSourcePath)) {
    errors.push(`${entry.spec}: route source is missing (${entry.routeSource})`);
  } else {
    const routeSource = readFileSync(routeSourcePath, 'utf8');
    const routeToken = new RegExp(escapeRegExp(entry.routeToken));
    if (!routeToken.test(routeSource)) {
      errors.push(
        `${entry.spec}: route token ${entry.routeToken} is missing from ${entry.routeSource}`
      );
    }
  }

  const screenshotNames = new Set<string>();
  for (const screenshot of entry.screenshots) {
    if (screenshotNames.has(screenshot)) {
      errors.push(`${entry.spec}: duplicate screenshot declaration ${screenshot}`);
    }
    screenshotNames.add(screenshot);
    for (const platform of ['darwin', 'linux']) {
      const baseline = path.join(
        visualRoot,
        entry.baselineDirectory,
        `${screenshot}-${visualProject}-${platform}.png`
      );
      expectedBaselines.add(baseline);
      if (!existsSync(baseline))
        errors.push(`${registryKey}: missing ${platform} baseline for ${screenshot}`);
    }
  }
}

for (const spec of visualSpecs) {
  if (!registrySpecs.has(spec)) errors.push(`${spec}: missing visual page registry entry`);
  if (!snapshotDirectories.includes(`${spec}-snapshots`))
    errors.push(`${spec}: missing snapshot directory`);
}
for (const snapshotDirectory of snapshotDirectories) {
  if (!registryDirectories.has(snapshotDirectory)) {
    errors.push(`${snapshotDirectory}: missing visual page registry entry`);
  }
  const spec = snapshotDirectory.replace(/-snapshots$/, '');
  if (!visualSpecs.includes(spec)) errors.push(`${snapshotDirectory}: no matching visual spec`);

  const directoryPath = path.join(visualRoot, snapshotDirectory);
  for (const png of readdirSync(directoryPath)
    .filter((fileName) => fileName.endsWith('.png'))
    .sort()) {
    const baseline = path.join(directoryPath, png);
    baselineCount += 1;
    if (!/^(.*)-(darwin|linux)\.png$/.test(png)) {
      errors.push(`${snapshotDirectory}/${png}: missing darwin/linux platform suffix`);
    } else if (!expectedBaselines.has(baseline)) {
      errors.push(`${snapshotDirectory}/${png}: orphan baseline is not declared in the registry`);
    }
  }
}

if (errors.length > 0) {
  process.stderr.write('Visual baseline validation failed:\n');
  for (const error of errors) process.stderr.write(`- ${error}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(
    `Visual baseline validation passed: ${visualSpecs.length} specs, ${visualPageRegistry.length} registry entries, ${baselineCount} declared platform baselines.\n`
  );
}
