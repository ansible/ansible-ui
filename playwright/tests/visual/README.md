# Visual Regression Testing with Playwright

Playwright screenshot tests that catch major layout and styling regressions — for example, a PatternFly upgrade or framework change that shifts the overall page structure. These are intentionally limited to one representative page per framework component; we don't want comprehensive screenshots for every page or minor UI element.

## How it works

1. **Baseline generation**: On first run (with `--update-snapshots`), Playwright captures screenshots and saves them as `.png` files in a `-snapshots/` directory alongside the test.
2. **Comparison**: On subsequent runs, new screenshots are compared pixel-by-pixel against the baselines.
3. **On failure**: Playwright produces three images in `test-results/` — the **expected** baseline, the **actual** screenshot, and a **diff** highlighting exactly what changed.

## Prerequisites

Create a `playwright/.env` file with your live instance credentials:

```
PLATFORM_UI=https://your-aap-instance.example.com
PLATFORM_USERNAME=admin
PLATFORM_PASSWORD=your-password
```

## Running the tests

All commands should be run from the `playwright/` directory.

```bash
# Generate initial baselines (first time, or after intentional UI changes)
npx playwright test tests/visual/ --project "live chromium" --update-snapshots

# Run visual tests (compares against baselines)
npx playwright test tests/visual/ --project "live chromium"

# Run using the @visual tag filter
TAGS=@visual npx playwright test --project "live chromium"

# View the HTML report (includes visual diffs on failure)
npx playwright show-report playwright/html-report
```

## Test structure

| Test                              | What it captures                                                                                 |
| --------------------------------- | ------------------------------------------------------------------------------------------------ |
| `overview page`                   | Main content area of the Overview/dashboard with mocked resource counts (chart and h1 masked)    |
| `overview resource counts card`   | Element-level screenshot of the `#resource-counts` card with mocked dashboard data               |
| `templates list page`             | Main content area of Templates list (PageTable) with mocked table rows (pagination masked)       |
| `templates list toolbar`          | Element-level screenshot of the toolbar (filters, actions) with mocked data                      |
| `eda credential create form`      | Main content area screenshot of EDA Credential create (PageForm)                                 |
| `eda credential create form elem` | Element-level screenshot of the form element                                                     |
| `organization wizard details`     | Main content area screenshot of Organization wizard step 1 (PageWizard)                          |
| `organization wizard review`      | Main content area screenshot of Organization wizard review step                                  |
| `inventory details page`          | Main content area of Inventory details (PageDetails) with mocked detail data (timestamps masked) |
| `inventory details panel`         | Element-level screenshot of the details key-value panel with mocked data (timestamps masked)     |

## Configuration

- **`maxDiffPixelRatio: 0.01`** — Allows up to 1% pixel difference to handle minor anti-aliasing and font rendering variance across environments.
- **`animations: 'disabled'`** — Freezes CSS animations to prevent timing-based flakiness.
- **`@not_mock` tag** — Tests are excluded from mock projects and only run against live instances.

## Upstream compatibility

Screenshots deliberately **exclude the brand logo** so that baselines are portable across upstream and downstream builds. The brand logo differs between distributions, so including it would make baselines environment-specific.

## Why we screenshot `.pf-v6-c-page__main`

"Full-page" tests screenshot `.pf-v6-c-page__main` (the main content area) rather than the entire viewport. This excludes the sidebar, whose expand/collapse state is non-deterministic across runs — the `navigateTo()` helper expands nav sections without collapsing them, causing CSS grid layout shifts that produce false-positive diffs. Targeting the main content area eliminates this flakiness and also excludes the brand logo (see above).

## Updating baselines

When a visual change is intentional (e.g., a PatternFly upgrade, a redesigned component), you must regenerate baselines for **both** platforms.

### macOS (darwin) baselines

```bash
npx playwright test tests/visual/ --project "live chromium" --update-snapshots
```

### Linux baselines (local via podman)

```bash
PLATFORM_SERVER=https://your-aap-instance \
PLATFORM_USERNAME=admin \
PLATFORM_PASSWORD=your-password \
./scripts/update-visual-baselines.sh

# Review and commit
git diff playwright/tests/visual/
git add playwright/tests/visual/**/*-linux.png
```

This workflow builds the UI inside a container using the official Playwright Linux image, serves it on https://localhost:4100, runs visual tests with --update-snapshots against your PLATFORM_SERVER for API calls, and writes updated -linux.png files directly to your working tree via volume mount.

Requires Podman or Docker installed locally.

### Linux baselines (via CI)

Playwright snapshots include a platform suffix (`-darwin` or `-linux`). The ephemeral AAP Playwright workflow runs on Linux runners, so it requires `-linux` baselines. Due to font rendering differences between environments, Linux baselines must be generated on Linux.

If you don't have Podman/Docker locally, use the CI workflow:

1. Open a PR with your changes
2. Comment `/run-aap-ui-playwright --update-snapshots` on the PR
3. The CI workflow will run the visual tests with `--update-snapshots` on the `aap-dev` runner, then auto-commit the updated `-linux.png` baselines back to your branch

> **Note:** The `--update-snapshots` flag can be combined with an AAP version: `/run-aap-ui-playwright 2.5-next --update-snapshots`

Review the updated `.png` files in the `-snapshots/` directory before merging.

## Stabilizing dynamic content

Visual tests must account for dynamic content that changes between runs. We use two complementary strategies: **API interception** with `page.route()` to supply deterministic mock data, and **masking** with Playwright's `mask` option for residual dynamic elements.

### Preferred: API interception with `page.route()`

For pages where dynamic content covers a large area (table rows, resource counts, detail fields), intercept the API endpoint in `beforeEach` and return a deterministic inline fixture. This lets the test render real UI content — status badges, labels, type icons, counts — without masking it away.

```ts
const mockResponse = { count: 1, results: [{ id: 1, name: 'My Resource', ... }] };

test.beforeEach(async ({ page }) => {
  await page.route('**/api/controller/v2/my-endpoint/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockResponse),
    });
  });
  await setupBefore({ path: '/my-page' })({ page });
});

test.afterEach(async ({ page }) => {
  await page.unrouteAll({ behavior: 'ignoreErrors' });
  await setupAfter({ page });
});
```

**Fixture guidelines:**

- Include only the fields the UI actually renders — trim `related`, `object_roles`, `url`, and other internal API fields
- Inline fixtures in the test file — no separate fixture files to maintain
- Register routes **before** navigation so intercepted responses are ready when the page loads

### Fallback: masking

For small dynamic elements where maintaining a fixture isn't worth the effort, use masking:

| Source of instability  | What to mask                | Why                                                  |
| ---------------------- | --------------------------- | ---------------------------------------------------- |
| **Timestamps**         | `.date-time`, `time`        | "Created" and "Modified" values change every run     |
| **Pagination counts**  | `.pf-v6-c-pagination`       | "1 - 10 of N" text changes with row count            |
| **Job activity chart** | `#job-activity .page-chart` | Chart data varies between runs                       |
| **Brand heading**      | `h1` (on overview)          | Heading text differs between upstream and downstream |

### Alternative techniques

For cases where `mask` is insufficient (e.g., you need to preserve element dimensions while hiding text, or the dynamic content is hard to isolate with a locator):

**Hide text with CSS injection:**

```ts
await page.addStyleTag({
  content: `.resource-name { color: transparent !important; }`,
});
```

**Normalize text with JavaScript:**

```ts
await page.evaluate(() => {
  document.querySelectorAll('.resource-name').forEach((el) => {
    el.textContent = 'Resource Name';
  });
});
```

> **Tip:** Prefer `page.route()` for large dynamic areas and `mask` for small elements. Use CSS or JS approaches only when you need finer control.

### When neither is needed

- **Empty create forms** (e.g., EDA Credential Create) — all fields are blank and labels are static, so the form element screenshot needs no masking.
- **Wizard steps with controlled input** (e.g., Organization Create) — when we fill a fixed value like `"Visual Test Org"`, the content is deterministic.
- **Element-level screenshots** (e.g., a `form`, `dl`, or toolbar locator) — these are scoped to a specific element and often avoid instability entirely.

## Where to add visual tests

We use **dedicated visual test files** under `playwright/tests/visual/`, one per page. Each file targets a specific page that exercises a major framework component, and each test captures both a full-page screenshot and an element-level screenshot of the key component.

### Page selection strategy

Rather than covering every page, we pick **one representative page per framework component** across different services (AWX, EDA, Platform). A visual regression in a shared framework component will be caught regardless of which page it surfaces on.

| Framework component | Service  | Page                  | Test file                              |
| ------------------- | -------- | --------------------- | -------------------------------------- |
| Overview/Dashboard  | Platform | Overview              | `overview-visual.spec.ts`              |
| PageTable/List      | AWX      | Templates List        | `templates-list-visual.spec.ts`        |
| PageForm            | EDA      | EDA Credential Create | `eda-credential-create-visual.spec.ts` |
| PageWizard          | Platform | Organization Create   | `organization-create-visual.spec.ts`   |
| PageDetails         | AWX      | Inventory Details     | `inventory-details-visual.spec.ts`     |

### File structure

Each test file follows a consistent pattern — one `describe` block with two tests:

1. **Main content screenshot** — captures the main content area (`.pf-v6-c-page__main`), excluding sidebar and brand logo for compatibility
2. **Element-level screenshot** — captures just the key framework component (form, toolbar, details panel, etc.)

```
playwright/tests/visual/
├── overview-visual.spec.ts               # Dashboard cards and resource counts (mocked)
├── templates-list-visual.spec.ts         # PageTable with mocked rows
├── eda-credential-create-visual.spec.ts  # PageForm element
├── organization-create-visual.spec.ts    # PageWizard steps
├── inventory-details-visual.spec.ts      # PageDetails panel (mocked)
└── README.md
```

### Adding a new page

When adding visual coverage for a new page:

1. Create a new file named `<page>-visual.spec.ts` in this directory
2. Choose a page that exercises a framework component not already covered, preferably from a service not already represented
3. Include both a main content area and element-level screenshot test
4. For pages with dynamic content, prefer `page.route()` API interception over masking — see "Stabilizing dynamic content" above
5. Mask only residual dynamic elements (timestamps, charts) that aren't worth maintaining fixtures for
6. Generate baselines with `--update-snapshots` and verify they pass on a second run

### Tagging

All visual tests **must** include both `@visual` and `@not_mock` tags. This enables selective execution and filtering via the `TAGS` environment variable:

```bash
# Run only visual tests
TAGS=@visual npx playwright test --project "live chromium"

# Run everything except visual tests
TAGS="not @visual" npx playwright test --project "live chromium"
```

## Where to run visual tests

### Ephemeral environments (primary)

Ephemeral environments are the intended home for visual tests. They provide:

- **Consistent rendering**
- **Clean state**
- **Isolated baselines** — Baselines are generated and compared in the same environment, eliminating cross-machine drift

Use the `@visual` tag to scope visual tests to ephemeral-only workflows:

```bash
# In the ephemeral pipeline
TAGS=@visual npx playwright test --project "live chromium"
```

### Jenkins

Visual tests **should be filtered out** of standard Jenkins runs.

```bash
# In Jenkins — exclude visual tests from the regular suite
TAGS="not @visual" npx playwright test --project "live chromium"
```

## Adding new visual tests

Follow the existing pattern. Use `page.route()` to intercept API endpoints with deterministic data, then screenshot `.pf-v6-c-page__main` (excludes sidebar and brand logo). Mask only residual dynamic elements like timestamps.

```ts
const mockResponse = {
  count: 1,
  next: null,
  previous: null,
  results: [{ id: 1, name: 'My Resource' /* only fields the UI renders */ }],
};

test.beforeEach(async ({ page }) => {
  await page.route('**/api/controller/v2/my-endpoint/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockResponse),
    });
  });
  await setupBefore({ path: '/my-page' })({ page });
});

test.afterEach(async ({ page }) => {
  await page.unrouteAll({ behavior: 'ignoreErrors' });
  await setupAfter({ page });
});

test('my page has no visual regressions', { tag: ['@visual', '@not_mock'] }, async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Expected Title' })).toBeVisible();

  const mainContent = page.locator('.pf-v6-c-page__main');
  await expect(mainContent).toHaveScreenshot('my-page.png', {
    maxDiffPixelRatio: 0.01,
    animations: 'disabled',
    mask: [page.locator('.date-time')],
  });

  // Element-level screenshot of the key framework component
  const detailsPanel = page.locator('dl').first();
  await expect(detailsPanel).toHaveScreenshot('my-page-panel.png', {
    maxDiffPixelRatio: 0.01,
    animations: 'disabled',
  });
});
```
