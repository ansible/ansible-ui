import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { PageNavigationItem, removeNavigationItemById } from '../framework';
import { AwxRoute } from '../frontend/awx/AwxRoutes';
import { useAwxNavigation } from '../frontend/awx/useAwxNavigation';
import { EdaRoute } from '../frontend/eda/EdaRoutes';
import { UnderDevelopment } from '../frontend/eda/under-development/UnderDevelopment';
import { useEdaNavigation } from '../frontend/eda/useEdaNavigation';
import { HubRoute } from '../frontend/hub/HubRoutes';
import { useHubNavigation } from '../frontend/hub/useHubNavigation';
import { PlatformLogin } from './PlatformLogin';
import { PlatformRoute } from './PlatformRoutes';
import { PlatformDashboard } from './dashboard/PlatformDashboard';

export function usePlatformNavigationA() {
  const { t } = useTranslation();
  const awx = useAwxNavigation();
  const hub = useHubNavigation();
  const eda = useEdaNavigation();

  // Inventories
  const inventories = removeNavigationItemById(awx, AwxRoute.Inventories);
  const hosts = removeNavigationItemById(awx, AwxRoute.Hosts);
  const projects = removeNavigationItemById(awx, AwxRoute.Projects);

  // Automation Mesh
  const topology = removeNavigationItemById(awx, AwxRoute.TopologyView);
  const instanceGroups = removeNavigationItemById(awx, AwxRoute.InstanceGroups);
  const instances = removeNavigationItemById(awx, AwxRoute.Instances);

  // Automation Analytics
  const analytics = removeNavigationItemById(awx, AwxRoute.Analytics);
  analytics!.label = t('Automation Analytics');

  // Content Discovery
  const namespaces = removeNavigationItemById(hub, HubRoute.Namespaces);
  const collections = removeNavigationItemById(hub, HubRoute.Collections);
  const executionEnvironments = removeNavigationItemById(awx, AwxRoute.ExecutionEnvironments);
  const decisionEnvironments = removeNavigationItemById(eda, EdaRoute.DecisionEnvironments);

  // Automation Execution
  const templates = removeNavigationItemById(awx, AwxRoute.Templates);
  const schedules = removeNavigationItemById(awx, AwxRoute.Schedules);
  const jobs = removeNavigationItemById(awx, AwxRoute.Jobs);

  // Rulebook Activations
  const ruleAudits = removeNavigationItemById(eda, EdaRoute.RuleAudits);
  const rulebookActivations = removeNavigationItemById(eda, EdaRoute.RulebookActivations);

  // Utilities
  const activityStream = removeNavigationItemById(awx, AwxRoute.ActivityStream);
  const signtureKeys = removeNavigationItemById(hub, HubRoute.SignatureKeys);
  const reposiitories = removeNavigationItemById(hub, HubRoute.Repositories);
  const remotes = removeNavigationItemById(hub, HubRoute.Remotes);
  const remoteRegistries = removeNavigationItemById(hub, HubRoute.RemoteRegistries);
  const tasks = removeNavigationItemById(hub, HubRoute.Tasks);
  const approvals = removeNavigationItemById(hub, HubRoute.Approvals);
  const notifications = removeNavigationItemById(awx, AwxRoute.Notifications);
  const managementJobs = removeNavigationItemById(awx, AwxRoute.ManagementJobs);
  const applications = removeNavigationItemById(awx, AwxRoute.Applications);

  // Access
  const organizations = removeNavigationItemById(awx, AwxRoute.Organizations);
  const teams = removeNavigationItemById(awx, AwxRoute.Teams);
  const users = removeNavigationItemById(awx, AwxRoute.Users);

  // Adminsitration
  const credentials = removeNavigationItemById(awx, AwxRoute.Credentials);
  const credentialTypes = removeNavigationItemById(awx, AwxRoute.CredentialTypes);

  const pageNavigationItems = useMemo<PageNavigationItem[]>(() => {
    const navigationItems = [
      {
        id: PlatformRoute.Dashboard,
        label: t('Overview'),
        path: 'overview',
        element: <PlatformDashboard />,
      },
      {
        label: t('Inventories'),
        path: 'inventories',
        children: [inventories, hosts],
      },
      {
        label: t('Automation Mesh'),
        path: 'mesh',
        children: [topology, instanceGroups, instances],
      },
      projects,
      {
        label: t('Content Discovery'),
        path: 'content',
        children: [namespaces, collections, executionEnvironments, decisionEnvironments],
      },
      {
        label: t('Automation Execution'),
        path: 'execution',
        children: [templates, schedules, jobs],
      },
      {
        label: t('Rulebook Activations'),
        path: 'rules',
        children: [ruleAudits, rulebookActivations],
      },
      analytics,
      {
        label: t('Quick Starts'),
        path: 'quick-starts',
        element: <UnderDevelopment />,
      },
      {
        id: 'platform-adminsitration',
        label: t('Administration'),
        path: 'administration',
        children: [
          {
            label: t('Utilities'),
            path: 'utilities',
            children: [
              activityStream,
              signtureKeys,
              reposiitories,
              remotes,
              remoteRegistries,
              tasks,
              approvals,
              notifications,
              managementJobs,
              applications,
            ],
          },
          {
            label: t('Access'),
            path: 'access',
            children: [organizations, teams, users],
          },
          credentials,
          credentialTypes,
        ],
      },
      {
        id: PlatformRoute.Root,
        path: '',
        element: <Navigate to="overview" />,
      },
    ];
    return navigationItems.filter((item) => item !== undefined) as PageNavigationItem[];
  }, [
    activityStream,
    analytics,
    applications,
    approvals,
    collections,
    credentialTypes,
    credentials,
    decisionEnvironments,
    executionEnvironments,
    hosts,
    instanceGroups,
    instances,
    inventories,
    jobs,
    managementJobs,
    namespaces,
    notifications,
    organizations,
    projects,
    remoteRegistries,
    remotes,
    reposiitories,
    ruleAudits,
    rulebookActivations,
    schedules,
    signtureKeys,
    t,
    tasks,
    teams,
    templates,
    topology,
    users,
  ]);
  return pageNavigationItems;
}

export function usePlatformNavigationB() {
  const { t } = useTranslation();
  const awx = useAwxNavigation();
  const hub = useHubNavigation();
  const eda = useEdaNavigation();

  const pageNavigationItems = useMemo<PageNavigationItem[]>(() => {
    const navigationItems = [
      {
        id: PlatformRoute.Login,
        path: 'login',
        element: <PlatformLogin />,
      },
      {
        id: PlatformRoute.Dashboard,
        label: t('Overview'),
        path: 'overview',
        element: <PlatformDashboard />,
      },
      {
        id: PlatformRoute.AWX,
        label: t('Automation Controller'),
        path: 'awx',
        children: awx,
      },
      {
        id: PlatformRoute.HUB,
        label: t('Automation Hub'),
        path: 'hub',
        children: hub,
      },
      {
        id: PlatformRoute.EDA,
        label: t('Event Driven Automation'),
        path: 'eda',
        children: eda,
      },
      {
        id: PlatformRoute.Root,
        path: '',
        element: <Navigate to="overview" />,
      },
    ];
    return navigationItems.filter((item) => item !== undefined) as PageNavigationItem[];
  }, [awx, eda, hub, t]);
  return pageNavigationItems;
}
