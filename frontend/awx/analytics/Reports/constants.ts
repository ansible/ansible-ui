import { Tag } from './types';

export enum TagName {
  operations = 'Operations',
  executive = 'Executive',
  subscription = 'Subscription',
  migration = 'Migration',
  controller = 'Controller',
  catalog = 'Catalog',
  automationHub = 'Automation Hub',
  modules = 'Modules',
  hosts = 'Hosts',
  tasks = 'Tasks',
  organization = 'Organization',
  jobTemplate = 'Job template',
  jobRuns = 'Job runs',
  timeSeries = 'Time series',
  performanceAnomalyDetection = 'Performance anomaly detection',
  savings = 'Savings',
}

export const TAGS: Tag[] = [
  {
    key: TagName.operations,
    name: 'Operations',
    description:
      'This report is useful to the engineers who manage day-to-day Ansible operations.  In other words, team members who write playbooks, do administration tasks within Controller, etc.',
  },
  {
    key: TagName.executive,
    name: 'Executive',
    description:
      'This report is useful to executives who want to monitor and learn about the Ansible operations happening across the company.',
  },
  {
    key: TagName.subscription,
    name: 'Subscription',
    description:
      'This report provides useful information around subscription data, helping you make decisions around compliance.',
  },
  {
    key: TagName.migration,
    name: 'Migration',
    description:
      'This report provides useful information around migrations, such as helping to identify what could be necessary to move to newer versions of the Ansible Automation Platform.',
  },
  {
    key: TagName.controller,
    name: 'Controller',
    description: 'This report provides information gathered from Controller.',
  },
  {
    key: TagName.catalog,
    name: 'Catalog',
    description:
      'This report provides information gathered from Automation Services Catalog.',
  },
  {
    key: TagName.automationHub,
    name: 'Automation Hub',
    description:
      'This report provides information gathered from Automation Hub.',
  },
  {
    key: TagName.modules,
    name: 'Modules',
    description:
      'This report groups information by Ansible modules, the specific executable code ran in individual playbook or job template tasks.',
  },
  {
    key: TagName.hosts,
    name: 'Hosts',
    description:
      'This report groups information by the hosts within the Ansible inventories that are executed by playbooks or job templates.',
  },
  {
    key: TagName.tasks,
    name: 'Tasks',
    description:
      'This report groups information by the individual tasks that make up a playbook or job template.',
  },
  {
    key: TagName.organization,
    name: 'Organization',
    description:
      'This report groups information by the organizations set up within the company’s Ansible Controller instances.',
  },
  {
    key: TagName.jobTemplate,
    name: 'Job template',
    description:
      'This report groups information by the job templates set up within the company’s Ansible Controller instances.',
  },
  {
    key: TagName.jobRuns,
    name: 'Job runs',
    description:
      'This report groups information by the individual runs of playbooks or job templates.',
  },
  {
    key: TagName.timeSeries,
    name: 'Time series',
    description:
      'This report groups information for a specified time range and granularity, such as weekly (e.g., from the past 12 weeks) or monthly (e.g., between August and November).',
  },
  {
    key: TagName.performanceAnomalyDetection,
    name: 'Performance anomaly detection',
    description:
      'This report provides the ability to detect anomalies in Ansible performance, such as identifying slow tasks or hosts, or tasks with high error rates.',
  },
  {
    key: TagName.savings,
    name: 'Savings',
    description:
      'This report is useful for showing potential or actual savings based on Ansible usage.',
  },
];

export const perPageOptions = [
  { title: '4', value: 4 },
  { title: '6', value: 6 },
  { title: '8', value: 8 },
  { title: '10', value: 10 },
];
