# Deprecations Dashboard Implementation Guide

This guide shows exactly how to add the Deprecations Dashboard to the AAP UI.

## Repository Structure

The repo is cloned at: `/Users/johnhardy/upstream/deprecations_ui/`

**Key directories:**
- `frontend/awx/` - AWX/Controller UI code
- `frontend/awx/administration/` - Administration pages
- `frontend/awx/main/` - Routes and navigation
- `platform/` - Platform launcher (dev server)

---

## Step 1: Add the Route Constant

**File:** `frontend/awx/main/AwxRoutes.tsx`

Add this line after `ActivityStream = 'awx-activity-stream',` (around line 17):

```typescript
ActivityStream = 'awx-activity-stream',
Deprecations = 'awx-deprecations',  // ADD THIS LINE
```

---

## Step 2: Create the Deprecations Page Structure

Create directory:
```bash
mkdir -p frontend/awx/administration/deprecations
```

**File:** `frontend/awx/administration/deprecations/Deprecations.tsx`

```typescript
import { PageHeader, PageLayout } from '@ansible/ansible-ui-framework';
import { useTranslation } from 'react-i18next';
import { useAwxConfig } from '../../common/useAwxConfig';
import { useGetDocsUrl } from '@ansible/common-ui/utils/useGetDocsUrl';
import { DeprecationsDashboard } from './DeprecationsDashboard';

export function Deprecations() {
  const { t } = useTranslation();
  const config = useAwxConfig();

  return (
    <PageLayout>
      <PageHeader
        title={t('Deprecations')}
        titleHelpTitle={t('Deprecations')}
        titleHelp={t(
          'Monitor and track Ansible deprecation warnings across your automation estate. This helps you identify and fix deprecated patterns before upgrading to newer versions of Ansible Core.'
        )}
        titleDocLink={useGetDocsUrl(config, 'deprecations')}
        description={t(
          'View deprecation warnings from job executions to proactively address compatibility issues.'
        )}
      />
      <DeprecationsDashboard />
    </PageLayout>
  );
}
```

**File:** `frontend/awx/administration/deprecations/DeprecationsDashboard.tsx`

```typescript
import { useTranslation } from 'react-i18next';
import { 
  Card, 
  CardBody, 
  CardTitle,
  Grid,
  GridItem,
  Text,
  TextContent,
  TextVariants
} from '@patternfly/react-core';

export function DeprecationsDashboard() {
  const { t } = useTranslation();

  return (
    <div style={{ padding: '24px' }}>
      {/* Stats Cards */}
      <Grid hasGutter>
        <GridItem span={4}>
          <Card>
            <CardTitle>{t('Total Warnings')}</CardTitle>
            <CardBody>
              <TextContent>
                <Text component={TextVariants.h1}>247</Text>
                <Text component={TextVariants.small}>▲ 23% vs previous period</Text>
              </TextContent>
            </CardBody>
          </Card>
        </GridItem>
        <GridItem span={4}>
          <Card>
            <CardTitle>{t('Affected Jobs')}</CardTitle>
            <CardBody>
              <TextContent>
                <Text component={TextVariants.h1}>45</Text>
                <Text component={TextVariants.small}>▼ 8% vs previous period</Text>
              </TextContent>
            </CardBody>
          </Card>
        </GridItem>
        <GridItem span={4}>
          <Card>
            <CardTitle>{t('Unique Issues')}</CardTitle>
            <CardBody>
              <TextContent>
                <Text component={TextVariants.h1}>12</Text>
                <Text component={TextVariants.small}>— No change</Text>
              </TextContent>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      {/* Heat Map Card */}
      <Card style={{ marginTop: '24px' }}>
        <CardTitle>{t('Deprecation Activity Heat Map')}</CardTitle>
        <CardBody>
          <Text>Heat map visualization will go here</Text>
          <Text component={TextVariants.small}>
            Shows deprecation frequency by type with color-coded severity
          </Text>
        </CardBody>
      </Card>

      {/* Table Card */}
      <Card style={{ marginTop: '24px' }}>
        <CardTitle>{t('Deprecation Issues')}</CardTitle>
        <CardBody>
          <Text>Table of deprecations will go here</Text>
          <Text component={TextVariants.small}>
            API: GET /api/controller/v2/jobs/&#123;id&#125;/job_events/?event=deprecated
          </Text>
        </CardBody>
      </Card>
    </div>
  );
}
```

---

## Step 3: Create the Route Hook

**File:** `frontend/awx/main/routes/useAwxDeprecationsRoutes.tsx`

```typescript
import { PageNavigationItem } from '@ansible/ansible-ui-framework';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Deprecations } from '../../administration/deprecations/Deprecations';
import { AwxRoute } from '../AwxRoutes';

export function useAwxDeprecationsRoutes() {
  const { t } = useTranslation();
  const deprecationsRoutes = useMemo<PageNavigationItem>(
    () => ({
      id: AwxRoute.Deprecations,
      label: t('Deprecations'),
      path: 'deprecations',
      element: <Deprecations />,
    }),
    [t]
  );
  return deprecationsRoutes;
}
```

---

## Step 4: Wire Up the Navigation

**File:** `frontend/awx/main/useAwxNavigation.tsx`

### 4a. Add the import (around line 23):

```typescript
import { useAwxActivityStreamRoutes } from './routes/useAwxActivityStreamRoutes';
import { useAwxDeprecationsRoutes } from './routes/useAwxDeprecationsRoutes';  // ADD THIS
```

### 4b. Create the hook instance (around line 53):

```typescript
const awxActivityStreamRoutes = useAwxActivityStreamRoutes();
const awxDeprecationsRoutes = useAwxDeprecationsRoutes();  // ADD THIS
```

### 4c. Add to administration menu (around line 142-148):

Find this section:
```typescript
children: activeAwxUser?.is_superuser
  ? [
      awxActivityStreamRoutes,
      awxWorkflowApprovalRoutes,
      awxNotificationsRoutes,
      awxManagementJobsRoutes,
    ]
  : [awxActivityStreamRoutes, awxWorkflowApprovalRoutes, awxNotificationsRoutes],
```

Change to:
```typescript
children: activeAwxUser?.is_superuser
  ? [
      awxActivityStreamRoutes,
      awxDeprecationsRoutes,  // ADD THIS
      awxWorkflowApprovalRoutes,
      awxNotificationsRoutes,
      awxManagementJobsRoutes,
    ]
  : [
      awxActivityStreamRoutes,
      awxDeprecationsRoutes,  // ADD THIS
      awxWorkflowApprovalRoutes,
      awxNotificationsRoutes
    ],
```

---

## Step 5: Run the Development Server

```bash
# Go to platform directory
cd /Users/johnhardy/upstream/deprecations_ui/platform

# Set your AAP backend
export PLATFORM_SERVER='https://35.227.179.76'
export PLATFORM_USERNAME='admin'
export PLATFORM_PASSWORD='Smartvm!23'

# Install dependencies (first time only)
cd /Users/johnhardy/upstream/deprecations_ui
npm ci

# Start dev server
cd platform
npm run start
```

**This will:**
1. Open browser at https://localhost:4100
2. Proxy API calls to your AAP instance
3. Show hot-reload UI updates as you edit

**Access the page:**
- Navigate to: Automation Execution → Administration → Deprecations
- URL: https://localhost:4100/awx/administration/deprecations

---

## Step 6: Implement Real Data Fetching

Once the basic page is working, replace the placeholder dashboard with real API calls.

**Example API fetch hook:**

Create: `frontend/awx/administration/deprecations/hooks/useDeprecationStats.tsx`

```typescript
import { useMemo } from 'react';
import { useAwxView } from '../../../common/useAwxView';
import { awxAPI } from '../../../common/api/awx-utils';

export function useDeprecationStats() {
  // This is a simplified example
  // You'll need to fetch jobs and aggregate deprecation events
  
  const jobsView = useAwxView({
    url: awxAPI`/jobs/`,
    // Add your query params
  });

  const stats = useMemo(() => {
    // Process jobs to extract deprecation data
    // Query each job's events with ?event=deprecated
    return {
      totalWarnings: 0,
      affectedJobs: 0,
      uniqueIssues: 0,
    };
  }, [jobsView.itemCount]);

  return stats;
}
```

---

## File Summary

Files you'll **create**:
1. `frontend/awx/administration/deprecations/Deprecations.tsx`
2. `frontend/awx/administration/deprecations/DeprecationsDashboard.tsx`
3. `frontend/awx/main/routes/useAwxDeprecationsRoutes.tsx`

Files you'll **modify**:
1. `frontend/awx/main/AwxRoutes.tsx` - Add route enum
2. `frontend/awx/main/useAwxNavigation.tsx` - Wire up navigation

---

## Next Steps

After the basic page is working:

1. **Implement real API integration** - Fetch deprecation events from jobs
2. **Add heat map component** - Use PatternFly charts
3. **Add data table** - Use PageTable with filters/sorting
4. **Add detail view** - Show specific deprecation with resolution guidance
5. **Add time period selector** - Filter by date range
6. **Write tests** - Add .test.tsx files

---

## Testing Your Changes

```bash
# Run linting
npm run eslint

# Fix linting issues
npm run eslint:fix

# Run type checking
npm run tsc

# Run tests
npm run vitest
```

---

## Creating a PR

```bash
# Create feature branch
git checkout -b feature/deprecations-dashboard

# Make your changes
# ...

# Run all checks
npm run test

# Commit
git add .
git commit -m "Add deprecations dashboard to administration section

- Add new Deprecations page under Administration menu
- Display deprecation warnings from job events
- Show heat map and statistics
- Respects RBAC permissions

Resolves: AAPRFE-2912"

# Push and create PR
git push origin feature/deprecations-dashboard
```

Visit https://github.com/ansible/ansible-ui and create the PR.

---

## API Endpoint Reference

**Get deprecation events for a job:**
```
GET /api/controller/v2/jobs/{job_id}/job_events/?event=deprecated
```

**Response:**
```json
{
  "count": 3,
  "results": [
    {
      "id": 12345,
      "event": "deprecated",
      "stdout": "[DEPRECATION WARNING]: The use of 'include'...",
      "start_line": 156,
      "task": "Task name",
      "play": "Play name",
      "playbook": "site.yml"
    }
  ]
}
```
