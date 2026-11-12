export type VisualPageEntry = {
  baselineDirectory: string;
  routePath: string;
  routeSource: string;
  /** Exact route-hook marker, e.g. `id: PlatformRoute.Users`. */
  routeToken: string;
  screenshots: readonly string[];
  spec: string;
};

export const visualPageRegistry: readonly VisualPageEntry[] = [
  {
    spec: 'overview-visual.spec.ts',
    baselineDirectory: 'overview-visual.spec.ts-snapshots',
    routePath: '/overview',
    routeSource: 'platform/main/usePlatformNavigation.tsx',
    routeToken: 'id: PlatformRoute.Overview',
    screenshots: ['overview-full-page', 'resource-counts-card'],
  },
  {
    spec: 'templates-list-visual.spec.ts',
    baselineDirectory: 'templates-list-visual.spec.ts-snapshots',
    routePath: '/execution/templates',
    routeSource: 'frontend/awx/main/routes/useAwxTemplateRoutes.tsx',
    routeToken: 'id: AwxRoute.Templates',
    screenshots: ['templates-list-full-page', 'templates-list-toolbar'],
  },
  {
    spec: 'inventory-details-visual.spec.ts',
    baselineDirectory: 'inventory-details-visual.spec.ts-snapshots',
    routePath: '/execution/infrastructure/inventories/1',
    routeSource: 'frontend/awx/main/routes/useAwxInventoryRoutes.tsx',
    routeToken: 'id: AwxRoute.InventoryDetails',
    screenshots: ['inventory-details-full-page', 'inventory-details-panel'],
  },
  {
    spec: 'eda-credential-create-visual.spec.ts',
    baselineDirectory: 'eda-credential-create-visual.spec.ts-snapshots',
    routePath: '/decisions/infrastructure/credentials/create',
    routeSource: 'frontend/eda/main/useEdaNavigation.tsx',
    routeToken: 'id: EdaRoute.CreateCredential',
    screenshots: ['eda-credential-create-full-page', 'eda-credential-create-form'],
  },
  {
    spec: 'organization-create-visual.spec.ts',
    baselineDirectory: 'organization-create-visual.spec.ts-snapshots',
    routePath: '/access/organizations/create',
    routeSource: 'platform/routes/useGetPlatformOrganizationsRoutes.tsx',
    routeToken: 'id: PlatformRoute.CreateOrganization',
    screenshots: ['organization-wizard-details-step', 'organization-wizard-review-step'],
  },
  {
    spec: 'credentials-list-visual.spec.ts',
    baselineDirectory: 'credentials-list-visual.spec.ts-snapshots',
    routePath: '/execution/infrastructure/credentials',
    routeSource: 'frontend/awx/main/routes/useAwxCredentialRoutes.tsx',
    routeToken: 'id: AwxRoute.Credentials',
    screenshots: ['credentials-list-full-page', 'credentials-list-shell'],
  },
  {
    spec: 'eda-rulebook-activations-visual.spec.ts',
    baselineDirectory: 'eda-rulebook-activations-visual.spec.ts-snapshots',
    routePath: '/decisions/rulebook-activations',
    routeSource: 'frontend/eda/main/useEdaNavigation.tsx',
    routeToken: 'id: EdaRoute.RulebookActivations',
    screenshots: ['eda-rulebook-activations-full-page', 'eda-rulebook-activations-shell'],
  },
  {
    spec: 'platform-users-visual.spec.ts',
    baselineDirectory: 'platform-users-visual.spec.ts-snapshots',
    routePath: '/access/users',
    routeSource: 'platform/routes/useGetPlatformUsersRoutes.tsx',
    routeToken: 'id: PlatformRoute.Users',
    screenshots: ['platform-users-full-page', 'platform-users-shell'],
  },
  {
    spec: 'platform-organizations-visual.spec.ts',
    baselineDirectory: 'platform-organizations-visual.spec.ts-snapshots',
    routePath: '/access/organizations',
    routeSource: 'platform/routes/useGetPlatformOrganizationsRoutes.tsx',
    routeToken: 'id: PlatformRoute.Organizations',
    screenshots: ['platform-organizations-full-page', 'platform-organizations-shell'],
  },
];
