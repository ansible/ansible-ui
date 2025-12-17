import { test } from '@playwright/test';
import { existsSync, readdirSync } from 'fs';
import { createReadStream } from 'fs';
import { createInterface } from 'readline';
import { join } from 'path';
import MCR from 'monocart-coverage-reports';
import { coverageOptions } from './coverage-options';

test('coverage - report', async () => {
  // Increase timeout for coverage generation - processing 100+ files can take several minutes
  test.setTimeout(10 * 60 * 1000); // 10 minutes

  const rawDir = join('coverage', 'raw');

  if (existsSync(rawDir)) {
    // eslint-disable-next-line no-console
    console.log('[Coverage Teardown] Merging raw V8 coverage files...');

    // Read all NDJSON coverage files
    const coverageFiles = readdirSync(rawDir).filter((f) => f.endsWith('.ndjson'));

    // eslint-disable-next-line no-console
    console.log(`[Coverage Teardown] Found ${coverageFiles.length} NDJSON coverage files`);

    if (coverageFiles.length === 0) {
      // eslint-disable-next-line no-console
      console.log('[Coverage Teardown] No coverage data found');
      return;
    }

    // Create MCR instance
    const mcr = MCR(coverageOptions);
    let totalLines = 0;

    // Stream each NDJSON file line-by-line to avoid memory issues
    for (const file of coverageFiles) {
      const filePath = join(rawDir, file);
      // eslint-disable-next-line no-console
      console.log(`[Coverage Teardown] Processing ${file}...`);

      const fileStream = createReadStream(filePath, { encoding: 'utf-8' });
      const rl = createInterface({
        input: fileStream,
        crlfDelay: Infinity,
      });

      for await (const line of rl) {
        if (line.trim()) {
          const coverageData = JSON.parse(line) as unknown;
          await mcr.add(coverageData);
          totalLines++;
        }
      }
    }

    // eslint-disable-next-line no-console
    console.log(
      `[Coverage Teardown] Processed ${totalLines} coverage entries from ${coverageFiles.length} files`
    );
    // eslint-disable-next-line no-console
    console.log('[Coverage Teardown] Generating coverage-final.json and lcov.info...');

    // Generate final reports - this is the ONLY time we call generate()
    await mcr.generate();

    // eslint-disable-next-line no-console
    console.log('[Coverage Teardown] Coverage reports generated successfully');
  } else {
    // eslint-disable-next-line no-console
    console.log('[Coverage Teardown] No coverage/raw directory found');
  }
});
