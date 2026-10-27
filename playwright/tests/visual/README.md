# Visual Regression Testing with Playwright

Playwright screenshot tests that catch major layout and styling regressions — for example, a PatternFly upgrade or framework change that shifts the overall page structure. These are intentionally limited to one representative page per framework component; we don't want comprehensive screenshots for every page or minor UI element.

## How it works

1. **Baseline generation**: On first run (with `--update-snapshots`), Playwright captures screenshots and saves them as `.png` files in a `-snapshots/` directory alongside the test.
2. **Comparison**: On subsequent runs, new screenshots are compared pixel-by-pixel against the baselines.
3. **On failure**: Playwright produces three images in `test-results/` — the **expected** baseline, the **actual** screenshot, and a **diff** highlighting exactly what changed.

## Prerequisites

Install dependencies with `npm ci` from the repository root. Mock-backed visual
tests need no AAP server or credentials. Podman or Docker is needed only when
generating Linux baselines locally; otherwise use the author-triggered workflow.

## Running the tests

Run Playwright commands from `playwright/`. Run
`npm run visual:check-baselines` from the repository root.

```bash
# Generate initial baselines (first time, or after intentional UI changes)
TAGS=@visual npx playwright test tests/visual/ --project "mock chromium" --update-snapshots=all

# Run visual tests (compares against baselines)
TAGS=@visual npx playwright test tests/visual/ --project "mock chromium"

# View the HTML report (includes visual diffs on failure)
npx playwright show-report playwright/html-report
```

## Test structure

Each page has one spec file with a main-content screenshot and a focused
component or shell screenshot. Specs use deterministic API fixtures and shared
stabilization. See [Adding a screen](#adding-a-screen) for the complete setup.

## Configuration

- **`maxDiffPixelRatio: 0.01`** — Allows up to 1% pixel difference to handle minor anti-aliasing and font rendering variance across environments.
- **`animations: 'disabled'`** — Freezes CSS animations to prevent timing-based flakiness.
- **Mock-backed visual tests** — Every visual spec installs deterministic fixtures and runs in the `mock chromium` project; no AAP backend is required.
- **Shared stabilization** — `stabilizeVisualPage()` freezes the clock, waits for network idle and loading indicators, disables motion, and clears focus before capture.
- **Coverage registry** — `visualPageRegistry.ts` maps every visual spec and screenshot name to its route token and baseline directory. `npm run visual:check-baselines` validates the registry, app route source, missing baselines, and orphan PNGs.

## Upstream compatibility

Content screenshots deliberately **exclude the brand logo** so that baselines are portable across upstream and downstream builds. Shell screenshots may include the masthead, but use `getBrandMasks(page)` and `maskColor: '#e8e8e8'` to cover distribution-specific branding while preserving the rest of the shell.

## Why we screenshot `.pf-v6-c-page__main`

"Full-page" tests screenshot `.pf-v6-c-page__main` (the main content area) rather than the entire viewport. This excludes the sidebar, whose expand/collapse state is non-deterministic across runs — the `navigateTo()` helper expands nav sections without collapsing them, causing CSS grid layout shifts that produce false-positive diffs. Targeting the main content area eliminates this flakiness and also excludes the brand logo (see above).

## Updating baselines

When a visual change is intentional (e.g., a PatternFly upgrade, a redesigned component), you must regenerate baselines for **both** platforms.

### macOS (darwin) baselines

```bash
npx playwright test tests/visual/ --project "mock chromium" --update-snapshots=all
```

### Linux baselines (local via podman)

```bash
../scripts/update-visual-baselines.sh

# Review and commit
git diff playwright/tests/visual/
git add playwright/tests/visual/**/*-linux.png
```

This workflow builds the UI inside a container using the official Playwright Linux image, serves it on https://localhost:4100, runs the mock-backed visual tests with --update-snapshots, and writes updated -linux.png files directly to your working tree via volume mount. It does not require an AAP server or credentials.

Requires Podman or Docker installed locally.

### Linux baselines (via CI)

Playwright snapshots include a platform suffix (`-darwin` or `-linux`). The ephemeral AAP Playwright workflow runs on Linux runners, so it requires `-linux` baselines. Due to font rendering differences between environments, Linux baselines must be generated on Linux.

After the PR baseline workflows are available on `devel`, you can use either trigger below if you don't have Podman/Docker locally:

1. Open a PR with your changes
2. Comment `/update-visual-baselines` on your PR
3. The workflow checks out the PR merge result, generates Linux `mock chromium` snapshots without an AAP backend, and commits changed baseline PNGs to the PR branch

This command accepts same-repository PRs only. The workflow runs the full visual suite and updates only `*-mock-chromium-linux.png` files. The broader `/run-aap-ui-playwright --update-snapshots` command remains available for the general AAP Playwright flow.

The author-triggered run checks out the PR merge commit so the images include the current `devel` base. It rejects the result if the PR head changes during generation; comment again to refresh the new head.

### Manual workflow dispatch

After the workflow is available on `devel`, authors with repository write access can also start it from **Actions → Update PR visual baselines → Run workflow**. Select `devel` as the workflow branch, then provide:

- `pr_number`: the PR number.
- `pr_ref`: the PR's head branch name.
- `pr_head_sha`: the full 40-character SHA of the PR's current head commit.

The workflow accepts open, same-repository PRs targeting `devel`. It generates baselines from the PR merge result and commits changed Linux mock Chromium PNGs to the PR branch. If the PR head advances during the run, it stops; dispatch it again with the latest branch and SHA.

After the workflow completes, review each updated PNG in the PR's **Files changed** tab against the intended UI change. Investigate unexpected image changes before merging.

## Stabilizing dynamic content

Visual tests must account for dynamic content that changes between runs. We use three complementary strategies: shared **API interception** with `installVisualMockApi()`, shared **stabilization** with `stabilizeVisualPage()`, and **masking** with Playwright's `mask` option for residual dynamic elements.

### Preferred: API interception with `page.route()`

For pages where dynamic content covers a large area (table rows, resource counts, detail fields), register the page's deterministic fixture set in `beforeEach`. The shared `visualMockApi.ts` owns the response data and route interception, so multiple visual specs cannot drift into subtly different versions of the same fixture.

```ts
test.beforeEach(async ({ page }) => {
  await installVisualMockApi(page, ['templates']);
  await setupBefore({ path: '/my-page' })({ page });
  await stabilizeVisualPage(page);
});

test.afterEach(async ({ page }) => {
  await page.unrouteAll({ behavior: 'ignoreErrors' });
  await setupAfter({ page });
});
```

**Fixture guidelines:**

- Include only the fields the UI actually renders — trim `related`, `object_roles`, `url`, and other internal API fields
- Keep deterministic fixtures in `visualMockApi.ts`; specs select only the page fixture they need
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

### Baseline refresh automation

Authors can comment `/update-visual-baselines` on a same-repository PR to refresh its Linux mock Chromium baselines. The run uses the PR merge result and commits changed PNGs to the author's PR branch. The weekly refresh remains the full `devel` drift backstop.

`.github/workflows/visual-regression-schedule.yml` runs the full mock-backed visual suite every Monday at 12:00 UTC with one worker on the Linux UI image and coverage collection disabled. It opens or updates `visual-regression/weekly-refresh` only when snapshots change. `workflow_dispatch` provides the same full refresh on demand without backend configuration.

## Where to add visual tests

We use **dedicated visual test files** under `playwright/tests/visual/`, one per page. Each file targets a specific page that exercises a major framework component, with a main-content screenshot and focused coverage of the page or application shell.

### Page selection strategy

Rather than covering every page, we pick **one representative page per framework component** across different services (AWX, EDA, Platform). A visual regression in a shared framework component will be caught regardless of which page it surfaces on.

| Framework component | Service  | Page                  | Test file                                 |
| ------------------- | -------- | --------------------- | ----------------------------------------- |
| Overview/Dashboard  | Platform | Overview              | `overview-visual.spec.ts`                 |
| PageTable/List      | AWX      | Templates List        | `templates-list-visual.spec.ts`           |
| PageForm            | EDA      | EDA Credential Create | `eda-credential-create-visual.spec.ts`    |
| PageWizard          | Platform | Organization Create   | `organization-create-visual.spec.ts`      |
| PageDetails         | AWX      | Inventory Details     | `inventory-details-visual.spec.ts`        |
| PageTable + shell   | AWX      | Credentials List      | `credentials-list-visual.spec.ts`         |
| PageTable + shell   | EDA      | Rulebook Activations  | `eda-rulebook-activations-visual.spec.ts` |
| PageTable + shell   | Platform | Users                 | `platform-users-visual.spec.ts`           |
| PageTable + shell   | Platform | Organizations         | `platform-organizations-visual.spec.ts`   |

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
├── credentials-list-visual.spec.ts       # PageTable and portable shell (mocked)
├── eda-rulebook-activations-visual.spec.ts # EDA status/count table and shell (mocked)
├── platform-users-visual.spec.ts          # Platform user table and shell (mocked)
├── platform-organizations-visual.spec.ts  # Platform organization table and shell (mocked)
└── README.md
```

### Adding a screen

When adding a screen, add one representative page for a framework component or
service that is not covered yet. Keep the screen out of the suite if its value
would be only a minor page-specific detail.

1. **Add deterministic data.** If an existing fixture set does not cover the
   page, add a key to `VisualMockPage` and the required responses/routes in
   `visualMockApi.ts`. The catch-all API route returns 404, so an unmocked
   request fails visibly instead of reaching a live backend.
2. **Create `<page>-visual.spec.ts`.** Follow the nearby specs: install fixtures,
   navigate with `setupBefore`, call `stabilizeVisualPage`, and clean up with
   `unrouteAll` plus `setupAfter`. Give each test a `should ...` name and the
   `@visual` tag. Assert important content with accessible locators before
   capturing screenshots.
3. **Capture useful areas.** Add a main-content screenshot of
   `.pf-v6-c-page__main` and a focused screenshot of the main framework
   component or shell. Use explicit screenshot names. Mask only residual
   dynamic regions; do not mask large areas that should remain covered.
4. **Register the screen.** Add an entry to `visualPageRegistry.ts` with these
   fields: `spec`, `baselineDirectory`, `routePath`, `routeSource`, `routeToken`,
   and `screenshots`. Use the exact route token from `routeSource` (for example,
   `id: PlatformRoute.Users`) and list each screenshot name without `.png`.
5. **Generate both platform baselines.** From `playwright/`, replace
   `<page>-visual.spec.ts` with the new spec filename:

   ```bash
   TAGS=@visual npx playwright test tests/visual/<page>-visual.spec.ts --project "mock chromium" --update-snapshots=all --workers=1 --retries=0
   ../scripts/update-visual-baselines.sh tests/visual/<page>-visual.spec.ts
   ```

   The first command writes Darwin snapshots; the container script writes Linux
   snapshots. Run the first command again without `--update-snapshots=all` to
   compare against the generated Darwin baseline.

6. **Check coverage and review the images.** From the repository root, run
   `npm run visual:check-baselines`. Review the PNG diff and remove unrelated
   snapshot changes before submitting. The checker catches missing registry
   entries, stale route tokens, missing platform baselines, and orphan PNGs.

Run `npm run visual:check-baselines` before submitting baseline changes. It
fails when a visual spec is missing from the registry, its route token is absent,
its snapshot directory is missing, or a screenshot lacks either its Darwin or
Linux baseline.

### Tagging

All visual tests **must** include the `@visual` tag and use deterministic fixtures. This enables selective execution and filtering via the `TAGS` environment variable:

```bash
# Run only visual tests
TAGS=@visual npx playwright test --project "mock chromium"

# Run a tagged suite while excluding visual tests
NOT_TAGS=@visual npx playwright test --project "mock chromium"
```

## Where to run visual tests

### Ephemeral environments (primary)

Ephemeral environments are the intended home for visual tests. They provide:

- **Consistent rendering**
- **Clean state**
- **Isolated baselines** — Baselines are generated and compared in the same environment, eliminating cross-machine drift

Use the `@visual` tag to scope visual tests to visual workflows:

```bash
# In the ephemeral pipeline
TAGS=@visual npx playwright test --project "mock chromium"
```

### Jenkins

Visual tests are excluded from the default `mock chromium` project. Keep them
out of standard CI suites; the dedicated visual workflows opt in with
`TAGS=@visual`.

```bash
# In Jenkins — explicitly exclude visual tests from a tagged suite
NOT_TAGS=@visual npx playwright test --project "mock chromium"
```
