/**
 * Playwright fixture for Hub collection uploads with automatic cleanup.
 *
 * This fixture provides methods to upload Ansible collections to Hub
 * and automatically cleans up uploaded collections after each test.
 *
 * @example
 * ```typescript
 * import { test, expect } from '@ansible/playwright/fixtures/collectionFixture';
 * import { setupBefore, setupAfter } from '@ansible/playwright/commands/setup';
 *
 * test.beforeEach(setupBefore({ path: '/hub/collections' }));
 * test.afterEach(setupAfter);
 *
 * test('can view uploaded collection', async ({ page, collection }) => {
 *   const uploaded = await collection.upload({ repository: 'staging' });
 *   await expect(page.locator('tbody')).toContainText(uploaded.name);
 *   // Cleanup is automatic!
 * });
 * ```
 */

import { test as baseTest, Page } from '@playwright/test';
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { constructURL, getCSRFToken, origin } from '../../commands/apiClient';
import { platformUI } from '../../commands/login';

// ES module compatibility for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// Configuration
// ============================================================================

/** Enable debug logging via environment variable */
const DEBUG = process.env.DEBUG_COLLECTION_FIXTURE === 'true';

/** Log a debug message if DEBUG is enabled */
function log(message: string): void {
  if (DEBUG) {
    // eslint-disable-next-line no-console
    console.log(`[CollectionFixture] ${message}`);
  }
}

// ============================================================================
// Types
// ============================================================================

/** Information about an uploaded collection */
export interface CollectionInfo {
  /** The namespace of the collection (e.g., 'ibm') */
  namespace: string;
  /** The name of the collection (e.g., 'ds8000') */
  name: string;
  /** The version of the collection (e.g., '1.1.0') */
  version: string;
  /** The repository where the collection was uploaded (e.g., 'staging') */
  repository: string;
}

/** Options for uploading a collection */
export interface UploadCollectionOptions {
  /** Repository to upload to (defaults to 'staging') */
  repository?: string;
  /** Custom tarball path (defaults to the fixture tarball) */
  tarballPath?: string;
}

/** Options for uploading a collection with a specific version */
export interface UploadVersionOptions {
  /** The namespace for the collection */
  namespace: string;
  /** The collection name */
  name: string;
  /** The version to upload (e.g., '1.0.0') */
  version: string;
  /** Repository to upload to (defaults to 'staging') */
  repository?: string;
  /** Base tarball to use as template (defaults to ds8000) */
  baseTarball?: string;
}

/** Options for approving/moving a collection to another repository */
export interface ApproveCollectionOptions {
  /** The namespace of the collection */
  namespace: string;
  /** The collection name */
  name: string;
  /** The version to approve */
  version: string;
  /** Source repository (defaults to 'staging') */
  sourceRepository?: string;
  /** Destination repository (defaults to 'validated') */
  destinationRepository?: string;
}

/** Options for copying a collection to repositories */
export interface CopyToRepositoriesOptions {
  /** The namespace of the collection */
  namespace: string;
  /** The collection name */
  name: string;
  /** The version to copy */
  version: string;
  /** Source repository (defaults to 'validated') */
  sourceRepository?: string;
  /** Destination repositories to copy to */
  destinationRepositories: string[];
}

/** Options for creating a namespace */
export interface CreateNamespaceOptions {
  /** Custom namespace name (defaults to auto-generated) */
  name?: string;
}

/** Hub task response */
interface TaskResponse {
  task: string;
}

/** Hub task state */
interface Task {
  state: 'waiting' | 'running' | 'completed' | 'failed' | 'canceled' | 'skipped';
  error?: {
    description?: string;
  };
  pulp_href?: string;
  name?: string;
  created_resources?: string[];
}

/** Tracks namespace creation state */
interface NamespaceTracker {
  name: string;
  /** true = we created it, false = it already existed */
  wasCreated: boolean;
}

/** Collection version search result from Hub API */
interface CollectionVersionSearchResult {
  data: Array<{
    collection_version: {
      namespace: string;
      name: string;
      version: string;
    };
    repository: {
      name: string;
    };
  }>;
}

/** The collection fixture interface */
export interface CollectionFixture {
  /**
   * Upload a collection tarball to Hub.
   * The collection will be automatically deleted after the test.
   */
  upload: (options?: UploadCollectionOptions) => Promise<CollectionInfo>;

  /**
   * Upload a collection with a specific version using galaxykit-generated tarball.
   * This creates a temporary tarball with the specified namespace/name/version.
   * The collection will be automatically deleted after the test.
   */
  uploadVersion: (options: UploadVersionOptions) => Promise<CollectionInfo>;

  /**
   * Approve/move a collection from one repository to another.
   * Typically used to move from 'staging' to 'validated'.
   */
  approveCollection: (options: ApproveCollectionOptions) => Promise<void>;

  /**
   * Copy a collection version to one or more repositories.
   * Unlike approve, this keeps the collection in the source repository.
   */
  copyToRepositories: (options: CopyToRepositoriesOptions) => Promise<void>;

  /**
   * Create a new namespace in Hub.
   * The namespace will be automatically deleted after the test (if it was created by this fixture).
   */
  createNamespace: (options?: CreateNamespaceOptions) => Promise<string>;

  /**
   * Get all uploaded collections (for inspection/debugging)
   */
  getUploadedCollections: () => CollectionInfo[];

  /**
   * Get all created namespaces (for inspection/debugging)
   */
  getCreatedNamespaces: () => string[];
}

// ============================================================================
// Helper Functions
// ============================================================================

/** Default path to the test collection tarball */
// Available collection tarballs for testing
// Using different tarballs for different tests prevents Pulp artifact storage conflicts
const COLLECTION_TARBALLS = {
  ds8000: path.resolve(__dirname, 'collection-files/ibm-ds8000-1.1.0.tar.gz'),
  zosmf: path.resolve(__dirname, 'collection-files/ibm-ibm_zosmf-1.4.1.tar.gz'),
  masAirgap: path.resolve(__dirname, 'collection-files/ibm-mas_airgap-2.6.2.tar.gz'),
  operatorSdk: path.resolve(__dirname, 'collection-files/ibm-operator_collection_sdk-1.1.0.tar.gz'),
  qradar: path.resolve(__dirname, 'collection-files/ibm-qradar-3.0.0.tar.gz'),
  spmToolbox: path.resolve(__dirname, 'collection-files/ibm-spm_toolbox-1.0.2.tar.gz'),
};

const DEFAULT_TARBALL_PATH = COLLECTION_TARBALLS.ds8000;

// Export tarball paths for use in tests
export { COLLECTION_TARBALLS };

/** Options for creating a dynamic collection tarball */
interface CreateDynamicTarballOptions {
  /** Base tarball to use as template */
  baseTarball?: string;
  /** Namespace for the collection */
  namespace: string;
  /** Name for the collection */
  name: string;
  /** Version for the collection */
  version: string;
}

/** Temporary directory for dynamic tarballs - cleaned up at end of fixture */
const tempDirs: string[] = [];

/**
 * Create a dynamic collection tarball with custom namespace/name/version.
 *
 * This extracts an existing tarball, modifies the metadata files (MANIFEST.json
 * and galaxy.yml), and repacks it. Useful for testing version switching.
 *
 * @param options - The namespace, name, and version for the new tarball
 * @returns Path to the newly created tarball
 */
function createDynamicTarball(options: CreateDynamicTarballOptions): string {
  const { namespace, name, version, baseTarball = DEFAULT_TARBALL_PATH } = options;

  // Create a unique temp directory for extraction
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'collection-'));
  tempDirs.push(tempDir);

  // Create a subdirectory for the collection contents
  const contentDir = path.join(tempDir, 'content');
  fs.mkdirSync(contentDir);

  log(`Creating dynamic tarball: ${namespace}.${name}-${version}`);

  // Extract the base tarball - files are at root level (no top-level directory)
  // Use COPYFILE_DISABLE to prevent macOS resource forks from being extracted
  execSync(`COPYFILE_DISABLE=1 tar -xzf "${baseTarball}" -C "${contentDir}" --exclude="._*"`);

  // Update galaxy.yml if it exists
  const galaxyPath = path.join(contentDir, 'galaxy.yml');
  if (fs.existsSync(galaxyPath)) {
    let galaxyContent = fs.readFileSync(galaxyPath, 'utf-8');
    galaxyContent = galaxyContent
      .replace(/^namespace:.*$/m, `namespace: ${namespace}`)
      .replace(/^name:.*$/m, `name: ${name}`)
      .replace(/^version:.*$/m, `version: ${version}`);
    fs.writeFileSync(galaxyPath, galaxyContent);
  }

  // Add a unique marker file to ensure unique artifact hash
  // This prevents Pulp artifact conflicts when multiple tests use the same base tarball
  const markerPath = path.join(contentDir, '.e2e-test-marker');
  const uniqueContent = `${namespace}-${name}-${version}-${Date.now()}-${Math.random()}`;
  fs.writeFileSync(markerPath, uniqueContent);

  // Calculate the checksum for the marker file
  const markerChecksum = createHash('sha256').update(uniqueContent).digest('hex');

  // Update FILES.json to include the marker file
  const filesPath = path.join(contentDir, 'FILES.json');
  if (fs.existsSync(filesPath)) {
    const filesJson = JSON.parse(fs.readFileSync(filesPath, 'utf-8')) as {
      files: Array<{ name: string; ftype: string; chksum_type: string; chksum_sha256: string }>;
    };
    // Add the marker file to the manifest with its checksum
    filesJson.files.push({
      name: '.e2e-test-marker',
      ftype: 'file',
      chksum_type: 'sha256',
      chksum_sha256: markerChecksum,
    });
    fs.writeFileSync(filesPath, JSON.stringify(filesJson, null, 2));
  }

  // Update MANIFEST.json with new namespace/name/version and FILES.json checksum
  const manifestPath = path.join(contentDir, 'MANIFEST.json');
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8')) as {
      collection_info: { namespace: string; name: string; version: string };
      file_manifest_file: {
        name: string;
        ftype: string;
        chksum_type: string;
        chksum_sha256: string;
      };
    };
    manifest.collection_info.namespace = namespace;
    manifest.collection_info.name = name;
    manifest.collection_info.version = version;

    // Calculate new FILES.json checksum
    if (fs.existsSync(filesPath)) {
      const filesContent = fs.readFileSync(filesPath);
      const filesChecksum = createHash('sha256').update(filesContent).digest('hex');
      manifest.file_manifest_file.chksum_sha256 = filesChecksum;
    }

    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  } else {
    throw new Error(`No MANIFEST.json found in ${baseTarball}`);
  }

  // Remove ALL macOS resource fork files (._*) right before creating the tarball
  // These may have been created when we wrote/modified files
  // They cause validation errors as they're not in the FILES.json manifest
  execSync(`find "${contentDir}" -name "._*" -type f -delete 2>/dev/null || true`);

  // Create the new tarball with files at root level (matching original structure)
  // Use COPYFILE_DISABLE to prevent macOS resource forks from being added to the tarball
  const newTarballPath = path.join(tempDir, `${namespace}-${name}-${version}.tar.gz`);
  execSync(`COPYFILE_DISABLE=1 tar -czf "${newTarballPath}" -C "${contentDir}" --exclude="._*" .`);

  log(`Created dynamic tarball at: ${newTarballPath}`);
  return newTarballPath;
}

/**
 * Clean up all temporary directories created for dynamic tarballs.
 */
function cleanupTempDirs(): void {
  for (const dir of tempDirs) {
    try {
      fs.rmSync(dir, { recursive: true, force: true });
      log(`Cleaned up temp dir: ${dir}`);
    } catch {
      // Ignore cleanup errors
    }
  }
  tempDirs.length = 0;
}

/** Set of task states that indicate failure */
const FAILING_STATES = new Set(['failed', 'canceled', 'skipped']);

/** Default timeout for task completion (60 seconds) */
const DEFAULT_TASK_TIMEOUT = 60000;

/**
 * Sleep for a specified duration without blocking the page.
 * Preferred over page.waitForTimeout as it doesn't tie up Playwright internals.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Parse collection info from a tarball filename.
 * Expected format: {namespace}-{name}-{version}.tar.gz
 */
function parseCollectionFromFilename(filename: string): {
  namespace: string;
  name: string;
  version: string;
} {
  const basename = path.basename(filename, '.tar.gz');
  const parts = basename.split('-');

  if (parts.length < 3) {
    throw new Error(
      `Invalid collection filename format: ${filename}. Expected format: namespace-name-version.tar.gz`
    );
  }

  // The namespace is the first part, name is the second, version is the rest joined
  // This handles cases like "ibm-ds8000-1.1.0" -> namespace: "ibm", name: "ds8000", version: "1.1.0"
  return {
    namespace: parts[0],
    name: parts[1],
    version: parts.slice(2).join('-'),
  };
}

/**
 * Wait for a Pulp task to complete.
 * Uses exponential backoff with configurable timeout.
 *
 * @param page - Playwright page object
 * @param taskUrl - The task URL returned from an API call
 * @param options - Configuration options
 * @returns The completed task object
 */
async function waitForTask(
  page: Page,
  taskUrl: string,
  options: { timeout?: number; initialDelay?: number; multiplier?: number } = {}
): Promise<Task> {
  const { timeout = DEFAULT_TASK_TIMEOUT, initialDelay = 200, multiplier = 1.5 } = options;

  // Extract task ID from URL (e.g., "/api/galaxy/pulp/api/v3/tasks/abc-123/" -> "abc-123")
  const urlParts = taskUrl.split('/').filter(Boolean);
  const taskId = urlParts.at(-1);
  if (!taskId) {
    throw new Error(`Invalid task URL: ${taskUrl}`);
  }

  log(`Waiting for task ${taskId}...`);

  const startTime = Date.now();
  let currentDelay = initialDelay;
  let attempt = 0;

  while (Date.now() - startTime < timeout) {
    await sleep(currentDelay);
    attempt++;

    const response = await page.request.get(
      constructURL(`/api/galaxy/pulp/api/v3/tasks/${taskId}/`)
    );

    if (response.status() === 404) {
      throw new Error(`Task not found: ${taskId}`);
    }

    const task = (await response.json()) as Task;
    log(`Task ${taskId} state: ${task.state} (attempt ${attempt})`);

    if (task.state === 'completed') {
      log(`Task ${taskId} completed successfully`);
      return task;
    }

    if (FAILING_STATES.has(task.state)) {
      const errorMsg = task.error?.description ?? `Task ${task.state} without error message`;
      log(`Task ${taskId} failed: ${errorMsg}`);
      throw new Error(errorMsg);
    }

    currentDelay = Math.round(currentDelay * multiplier);
  }

  const elapsed = Date.now() - startTime;
  throw new Error(`Task timed out after ${elapsed}ms (${attempt} attempts): ${taskId}`);
}

/**
 * Upload a collection tarball via the Hub API.
 */
async function uploadCollection(
  page: Page,
  tarballPath: string,
  repository: string
): Promise<CollectionInfo> {
  log(`Uploading collection from ${tarballPath} to ${repository}...`);

  // Read the tarball file
  if (!fs.existsSync(tarballPath)) {
    throw new Error(`Collection tarball not found: ${tarballPath}`);
  }

  const fileBuffer = fs.readFileSync(tarballPath);
  const fileName = path.basename(tarballPath);

  // Get CSRF token
  const csrfToken = await getCSRFToken(page);

  // Upload via multipart POST
  const uploadUrl = constructURL(
    `/api/galaxy/v3/plugin/ansible/content/${repository}/collections/artifacts/`
  );

  const response = await page.request.post(uploadUrl, {
    multipart: {
      file: {
        name: fileName,
        mimeType: 'application/gzip',
        buffer: fileBuffer,
      },
    },
    headers: {
      'X-CSRFToken': csrfToken,
      Origin: origin,
      Referer: platformUI,
    },
  });

  if (response.status() !== 202) {
    const errorText = await response.text();
    throw new Error(`Failed to upload collection (status ${response.status()}): ${errorText}`);
  }

  const taskResponse = (await response.json()) as TaskResponse;

  // Wait for the upload task to complete
  await waitForTask(page, taskResponse.task);

  // Parse collection info from filename
  const { namespace, name, version } = parseCollectionFromFilename(fileName);

  log(`Collection uploaded: ${namespace}.${name}-${version}`);

  return {
    namespace,
    name,
    version,
    repository,
  };
}

/**
 * Delete a collection from Hub.
 */
async function deleteCollection(page: Page, collection: CollectionInfo): Promise<void> {
  log(`Deleting collection ${collection.namespace}.${collection.name}...`);

  const csrfToken = await getCSRFToken(page);

  const deleteUrl = constructURL(
    `/api/galaxy/v3/plugin/ansible/content/${collection.repository}/collections/index/${collection.namespace}/${collection.name}/`
  );

  const response = await page.request.delete(deleteUrl, {
    headers: {
      'X-CSRFToken': csrfToken,
      Origin: origin,
      Referer: platformUI,
    },
  });

  // 202 means deletion task started, 404 means already deleted
  if (response.status() === 202) {
    const taskResponse = (await response.json()) as TaskResponse;
    await waitForTask(page, taskResponse.task);
    log(`Collection ${collection.namespace}.${collection.name} deleted`);
  } else if (response.status() === 404 || response.status() === 204) {
    log(`Collection ${collection.namespace}.${collection.name} already deleted or not found`);
  } else {
    // Log but don't throw - we don't want cleanup failures to fail tests
    // eslint-disable-next-line no-console
    console.warn(
      `Warning: Failed to delete collection ${collection.namespace}.${collection.name} (status ${response.status()})`
    );
  }
}

/**
 * Delete all collections in a namespace.
 * This must be done before deleting the namespace itself.
 */
async function deleteCollectionsInNamespace(page: Page, namespace: string): Promise<void> {
  log(`Searching for collections in namespace ${namespace}...`);

  const searchUrl = constructURL(
    `/api/galaxy/v3/plugin/ansible/search/collection-versions/?namespace=${namespace}`
  );

  const response = await page.request.get(searchUrl);

  if (response.status() !== 200) {
    log(`Failed to search collections in namespace ${namespace} (status ${response.status()})`);
    return;
  }

  const data = (await response.json()) as CollectionVersionSearchResult;
  const collections = data.data ?? [];

  if (collections.length === 0) {
    log(`No collections found in namespace ${namespace}`);
    return;
  }

  log(`Found ${collections.length} collection(s) in namespace ${namespace}`);

  // Track unique collections (same collection may have multiple versions)
  const seen = new Set<string>();

  for (const item of collections) {
    const key = `${item.collection_version.namespace}.${item.collection_version.name}@${item.repository.name}`;
    if (seen.has(key)) continue;
    seen.add(key);

    await deleteCollection(page, {
      namespace: item.collection_version.namespace,
      name: item.collection_version.name,
      version: item.collection_version.version,
      repository: item.repository.name,
    });
  }
}

/**
 * Create a namespace in Hub.
 *
 * @returns Object with namespace name and whether it was newly created
 */
async function createNamespace(
  page: Page,
  name: string
): Promise<{ name: string; wasCreated: boolean }> {
  log(`Creating namespace ${name}...`);

  const csrfToken = await getCSRFToken(page);

  const createUrl = constructURL('/api/galaxy/_ui/v1/namespaces/');

  const response = await page.request.post(createUrl, {
    data: { name },
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken,
      Origin: origin,
      Referer: platformUI,
    },
  });

  if (response.status() === 201) {
    log(`Namespace ${name} created`);
    return { name, wasCreated: true };
  }

  if (response.status() === 409) {
    // Namespace already exists - that's fine, just track it but don't delete later
    log(`Namespace ${name} already exists`);
    return { name, wasCreated: false };
  }

  const errorText = await response.text();
  throw new Error(
    `Failed to create namespace '${name}' (status ${response.status()}): ${errorText}`
  );
}

/**
 * Delete a namespace from Hub.
 * Collections in the namespace are deleted first.
 */
async function deleteNamespace(page: Page, name: string): Promise<void> {
  log(`Deleting namespace ${name}...`);

  // First, delete any collections in this namespace
  await deleteCollectionsInNamespace(page, name);

  const csrfToken = await getCSRFToken(page);

  const deleteUrl = constructURL(`/api/galaxy/_ui/v1/namespaces/${name}/`);

  const response = await page.request.delete(deleteUrl, {
    headers: {
      'X-CSRFToken': csrfToken,
      Origin: origin,
      Referer: platformUI,
    },
  });

  // 202/204 means success, 404 means already deleted
  if (response.status() === 202) {
    const taskResponse = (await response.json()) as TaskResponse;
    await waitForTask(page, taskResponse.task);
    log(`Namespace ${name} deleted`);
  } else if (response.status() === 404 || response.status() === 204) {
    log(`Namespace ${name} already deleted or not found`);
  } else {
    // eslint-disable-next-line no-console
    console.warn(`Warning: Failed to delete namespace '${name}' (status ${response.status()})`);
  }
}

/**
 * Generate a unique namespace name for testing.
 */
function generateNamespaceName(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  // Namespace names must be lowercase and can only contain letters, numbers, and underscores
  return `e2e_ns_${timestamp}_${random}`.toLowerCase();
}

/** Repository info from Pulp API */
interface PulpRepository {
  pulp_href: string;
  name: string;
}

/** Collection version info from Pulp API */
interface PulpCollectionVersion {
  pulp_href: string;
  namespace: string;
  name: string;
  version: string;
}

/**
 * Approve/move a collection version from one repository to another.
 * This is typically used to move collections from 'staging' to 'validated'.
 */
async function approveCollectionVersion(
  page: Page,
  options: {
    namespace: string;
    name: string;
    version: string;
    sourceRepository: string;
    destinationRepository: string;
  }
): Promise<void> {
  const { namespace, name, version, sourceRepository, destinationRepository } = options;

  log(
    `Approving ${namespace}.${name}-${version} from ${sourceRepository} to ${destinationRepository}...`
  );

  const csrfToken = await getCSRFToken(page);

  // Get source repository pulp_href
  const sourceRepoResponse = await page.request.get(
    constructURL(`/api/galaxy/pulp/api/v3/repositories/ansible/ansible/?name=${sourceRepository}`)
  );
  if (sourceRepoResponse.status() !== 200) {
    throw new Error(`Failed to find source repository: ${sourceRepository}`);
  }
  const sourceRepoData = (await sourceRepoResponse.json()) as { results: PulpRepository[] };
  if (sourceRepoData.results.length === 0) {
    throw new Error(`Source repository not found: ${sourceRepository}`);
  }
  const sourceRepoHref = sourceRepoData.results[0].pulp_href;
  const sourceRepoId = sourceRepoHref.split('/').filter(Boolean).at(-1);

  // Get destination repository pulp_href
  const destRepoResponse = await page.request.get(
    constructURL(
      `/api/galaxy/pulp/api/v3/repositories/ansible/ansible/?name=${destinationRepository}`
    )
  );
  if (destRepoResponse.status() !== 200) {
    throw new Error(`Failed to find destination repository: ${destinationRepository}`);
  }
  const destRepoData = (await destRepoResponse.json()) as { results: PulpRepository[] };
  if (destRepoData.results.length === 0) {
    throw new Error(`Destination repository not found: ${destinationRepository}`);
  }
  const destRepoHref = destRepoData.results[0].pulp_href;

  // Get collection version pulp_href
  const cvResponse = await page.request.get(
    constructURL(
      `/api/galaxy/pulp/api/v3/content/ansible/collection_versions/?namespace=${namespace}&name=${name}&version=${version}`
    )
  );
  if (cvResponse.status() !== 200) {
    throw new Error(`Failed to find collection version: ${namespace}.${name}-${version}`);
  }
  const cvData = (await cvResponse.json()) as { results: PulpCollectionVersion[] };
  if (cvData.results.length === 0) {
    throw new Error(`Collection version not found: ${namespace}.${name}-${version}`);
  }
  const cvHref = cvData.results[0].pulp_href;

  // Use the move API endpoint
  const moveUrl = constructURL(
    `/api/galaxy/pulp/api/v3/repositories/ansible/ansible/${sourceRepoId}/move_collection_version/`
  );

  const response = await page.request.post(moveUrl, {
    data: {
      collection_versions: [cvHref],
      destination_repositories: [destRepoHref],
    },
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken,
      Origin: origin,
      Referer: platformUI,
    },
  });

  if (response.status() === 202) {
    const taskResponse = (await response.json()) as TaskResponse;
    await waitForTask(page, taskResponse.task);
    log(`Collection ${namespace}.${name}-${version} approved to ${destinationRepository}`);
  } else {
    const errorText = await response.text();
    throw new Error(
      `Failed to approve collection ${namespace}.${name}-${version} (status ${response.status()}): ${errorText}`
    );
  }
}

/**
 * Copy a collection version to one or more repositories.
 * Unlike approve/move, this keeps the collection in the source repository.
 */
async function copyCollectionToRepositories(
  page: Page,
  options: {
    namespace: string;
    name: string;
    version: string;
    sourceRepository: string;
    destinationRepositories: string[];
  }
): Promise<void> {
  const { namespace, name, version, sourceRepository, destinationRepositories } = options;

  log(
    `Copying ${namespace}.${name}-${version} from ${sourceRepository} to ${destinationRepositories.join(', ')}...`
  );

  const csrfToken = await getCSRFToken(page);

  // Use the copy API endpoint
  const copyUrl = constructURL(
    `/api/galaxy/v3/plugin/ansible/content/${sourceRepository}/collections/index/${namespace}/${name}/versions/${version}/copy/`
  );

  const response = await page.request.post(copyUrl, {
    data: {
      destination_repositories: destinationRepositories,
    },
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken,
      Origin: origin,
      Referer: platformUI,
    },
  });

  if (response.status() === 202) {
    const taskResponse = (await response.json()) as TaskResponse;
    await waitForTask(page, taskResponse.task);
    log(
      `Collection ${namespace}.${name}-${version} copied to ${destinationRepositories.join(', ')}`
    );
  } else {
    const errorText = await response.text();
    throw new Error(
      `Failed to copy collection ${namespace}.${name}-${version} (status ${response.status()}): ${errorText}`
    );
  }
}

// ============================================================================
// Fixture Definition
// ============================================================================

/**
 * Extended test with collection fixture.
 *
 * @example
 * ```typescript
 * import { test, expect } from '@ansible/playwright/fixtures/collectionFixture';
 *
 * test('my test', async ({ page, collection }) => {
 *   const uploaded = await collection.upload();
 *   // ... test logic ...
 *   // Cleanup is automatic!
 * });
 * ```
 */
export const test = baseTest.extend<{ collection: CollectionFixture }>({
  collection: async ({ page }, use) => {
    // Track resources for cleanup
    const uploadedCollections: CollectionInfo[] = [];
    const trackedNamespaces: NamespaceTracker[] = [];

    // Create the fixture
    const fixture: CollectionFixture = {
      upload: async (options: UploadCollectionOptions = {}) => {
        const repository = options.repository ?? 'staging';
        const tarballPath = options.tarballPath ?? DEFAULT_TARBALL_PATH;

        const collectionInfo = await uploadCollection(page, tarballPath, repository);
        uploadedCollections.push(collectionInfo);

        return collectionInfo;
      },

      uploadVersion: async (options: UploadVersionOptions) => {
        const repository = options.repository ?? 'staging';

        // Create a dynamic tarball with the specified namespace/name/version
        const tarballPath = createDynamicTarball({
          namespace: options.namespace,
          name: options.name,
          version: options.version,
          baseTarball: options.baseTarball,
        });

        // Upload the collection
        await uploadCollection(page, tarballPath, repository);

        // The actual uploaded collection should match the dynamic tarball
        const result: CollectionInfo = {
          namespace: options.namespace,
          name: options.name,
          version: options.version,
          repository,
        };

        // Track for cleanup
        uploadedCollections.push(result);

        return result;
      },

      approveCollection: async (options: ApproveCollectionOptions) => {
        const sourceRepository = options.sourceRepository ?? 'staging';
        const destinationRepository = options.destinationRepository ?? 'published';

        await approveCollectionVersion(page, {
          namespace: options.namespace,
          name: options.name,
          version: options.version,
          sourceRepository,
          destinationRepository,
        });

        // Update tracked collection's repository if it matches
        const tracked = uploadedCollections.find(
          (c) =>
            c.namespace === options.namespace &&
            c.name === options.name &&
            c.version === options.version
        );
        if (tracked) {
          tracked.repository = destinationRepository;
        }
      },

      copyToRepositories: async (options: CopyToRepositoriesOptions) => {
        const sourceRepository = options.sourceRepository ?? 'validated';

        await copyCollectionToRepositories(page, {
          namespace: options.namespace,
          name: options.name,
          version: options.version,
          sourceRepository,
          destinationRepositories: options.destinationRepositories,
        });

        // Add entries for the copied collections so they get cleaned up
        for (const destRepo of options.destinationRepositories) {
          uploadedCollections.push({
            namespace: options.namespace,
            name: options.name,
            version: options.version,
            repository: destRepo,
          });
        }
      },

      createNamespace: async (options: CreateNamespaceOptions = {}) => {
        const name = options.name ?? generateNamespaceName();
        const result = await createNamespace(page, name);
        trackedNamespaces.push(result);

        return result.name;
      },

      getUploadedCollections: () => [...uploadedCollections],

      getCreatedNamespaces: () => trackedNamespaces.map((ns) => ns.name),
    };

    // Provide the fixture to the test
    await use(fixture);

    // Cleanup: Delete all uploaded collections first
    log(
      `Cleanup: ${uploadedCollections.length} collection(s), ${trackedNamespaces.length} namespace(s)`
    );

    for (const collectionInfo of uploadedCollections) {
      try {
        await deleteCollection(page, collectionInfo);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn(
          `Warning: Failed to cleanup collection ${collectionInfo.namespace}.${collectionInfo.name}:`,
          error
        );
      }
    }

    // Cleanup: Delete namespaces that WE created (not pre-existing ones)
    for (const namespace of trackedNamespaces) {
      if (!namespace.wasCreated) {
        log(`Skipping cleanup of pre-existing namespace ${namespace.name}`);
        continue;
      }

      try {
        await deleteNamespace(page, namespace.name);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn(`Warning: Failed to cleanup namespace ${namespace.name}:`, error);
      }
    }

    // Cleanup: Remove temporary tarball directories
    cleanupTempDirs();

    log('Cleanup complete');
  },
});

// Re-export expect for convenience
export { expect } from '@playwright/test';
