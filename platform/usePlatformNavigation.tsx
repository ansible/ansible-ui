import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { PageNavigationItem, removeNavigationItemById } from '../framework';
import { AwxRoute } from '../frontend/awx/AwxRoutes';
import { useAwxNavigation } from '../frontend/awx/useAwxNavigation';
import { EdaRoute } from '../frontend/eda/EdaRoutes';
import { useEdaNavigation } from '../frontend/eda/useEdaNavigation';
import { HubRoute } from '../frontend/hub/HubRoutes';
import { useHubNavigation } from '../frontend/hub/useHubNavigation';
import { PlatformRoute } from './PlatformRoutes';
import { PlatformDashboard } from './dashboard/PlatformDashboard';
import { Lightspeed } from './lightspeed/Lightspeed';

export function usePlatformNavigation() {
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
      projects,
      {
        label: t('Automation Execution'),
        path: 'execution',
        children: [jobs, templates, schedules, executionEnvironments],
      },
      {
        label: t('Automation Decisions'),
        path: 'automation-decisions',
        children: [ruleAudits, rulebookActivations, decisionEnvironments],
      },
      {
        label: t('Automation Infrastructure'),
        path: 'mesh',
        children: [topology, instanceGroups, instances, inventories, hosts],
      },
      {
        label: t('Automation Content'),
        path: 'content',
        children: [namespaces, collections],
      },
      analytics,
      {
        label: t('Automation Credentials'),
        path: 'keys',
        children: [
          credentials,
          credentialTypes,
          {
            id: 'API Tokens',
            label: 'API Tokens',
            path: 'tokens',
          },
        ],
      },
      {
        label: t('Access Management'),
        path: 'access',
        children: [organizations, teams, users],
      },
      {
        id: 'lightspeed',
        label: 'Ansible Lightspeed with Watson Code Assistant',
        path: 'lightspeed',
        element: <Lightspeed />,
      },
      {
        id: PlatformRoute.Root,
        path: '',
        element: <Navigate to="overview" />,
      },
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
