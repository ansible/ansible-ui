/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { Label } from '@ansible/awx-ui/interfaces/Label';
import { IApiData } from '../mockData';

/* eslint-disable @typescript-eslint/no-explicit-any */
export function controllerRelations(item: Record<string, any>, data: IApiData) {
  if (!item) return;
  if (!item.summary_fields) {
    item.summary_fields = {};
  }
  if (!item.summary_fields.labels) {
    item.summary_fields.labels = {
      results: [],
    } as { results: Label[] };
    if ('labels' in item && Array.isArray(item.labels)) {
      item.labels.forEach((labelId: unknown) => {
        if (typeof labelId !== 'number') {
          return;
        }
        const label = data.api.controller.v2.labels.find((l) => l.id === labelId);
        if (label) {
          (item.summary_fields.labels.results as Label[]).push(label as Label);
        }
      });
    }
  }
  if (!item.summary_fields.recent_jobs) {
    item.summary_fields.recent_jobs = [];
  }
  if (!item.summary_fields.user_capabilities) {
    item.summary_fields.user_capabilities = {
      edit: true,
      delete: true,
      start: true,
      schedule: true,
      copy: true,
    };
  }
  if (!item.summary_fields.resource) {
    // TODO ----> This is a temporary solution to avoid errors in the tests
    // Really when creating the organization, the ansible_id should be set to a valid value
    item.summary_fields.resource = {
      ansible_id: '1234',
    };
  }
  if (!item.summary_fields.created_by) {
    item.summary_fields.created_by = {
      username: 'admin',
    };
  }
  if (!item.summary_fields.modified_by) {
    item.summary_fields.modified_by = {
      username: 'admin',
    };
  }
  if (typeof item.organization === 'number') {
    const organization = data.api.controller.v2.organizations.find(
      (org) => org.id === item.organization
    );
    if (organization) {
      item.summary_fields.organization = organization;
    }
  } else {
    // HACK for JT until we figure out how organization is being set
    item.summary_fields.organization = {
      id: 1,
      name: 'Default',
    };
  }
  if (typeof item.project === 'number') {
    const project = data.api.controller.v2.projects.find((project) => project.id === item.project);
    if (project) {
      item.summary_fields.project = project;
    }
  }
  if (typeof item.inventory === 'number') {
    const inventory = data.api.controller.v2.inventories.find(
      (inventory) => inventory.id === item.inventory
    );
    if (inventory) {
      item.summary_fields.inventory = inventory;
    }
  }
  if (typeof item.execution_envionment === 'number') {
    const execution_environment = data.api.controller.v2.execution_environments.find(
      (execution_environment) => execution_environment.id === item.execution_envionment
    );
    if (execution_environment) {
      item.summary_fields.execution_environment = execution_environment;
    }
  } else if (!item.execution_environment) {
    item.summary_fields.execution_environment = {
      id: 1,
      name: 'Default',
    };
  }

  if (typeof item.job_template === 'number') {
    const job_template = data.api.controller.v2.job_templates.find(
      (job_template) => job_template.id === item.job_template
    );
    if (job_template) {
      item.summary_fields.job_template = job_template;
    }
  }

  if (!item.related) {
    item.related = {};
    // item.relations.stdout = item.summary_fields.labels.results.map((label: any) => {
  }

  return item;
}
