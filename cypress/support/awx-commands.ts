/// <reference types="cypress" />

import '@cypress/code-coverage/support';
import jsyaml from 'js-yaml';
import { SetRequired } from 'type-fest';
import { randomString } from '../../framework/utils/random-string';
import { AwxItemsResponse } from '../../frontend/awx/common/AwxItemsResponse';
import { Application } from '../../frontend/awx/interfaces/Application';
import { AwxHost } from '../../frontend/awx/interfaces/AwxHost';
import { AwxToken } from '../../frontend/awx/interfaces/AwxToken';
import { Credential } from '../../frontend/awx/interfaces/Credential';
import { CredentialType } from '../../frontend/awx/interfaces/CredentialType';
import { ExecutionEnvironment } from '../../frontend/awx/interfaces/ExecutionEnvironment';
import { Instance } from '../../frontend/awx/interfaces/Instance';
import { InstanceGroup } from '../../frontend/awx/interfaces/InstanceGroup';
import { Inventory } from '../../frontend/awx/interfaces/Inventory';
import { InventoryGroup } from '../../frontend/awx/interfaces/InventoryGroup';
import { InventorySource } from '../../frontend/awx/interfaces/InventorySource';
import { Job } from '../../frontend/awx/interfaces/Job';
import { JobEvent } from '../../frontend/awx/interfaces/JobEvent';
import { JobTemplate } from '../../frontend/awx/interfaces/JobTemplate';
import { Label } from '../../frontend/awx/interfaces/Label';
import { NotificationTemplate } from '../../frontend/awx/interfaces/NotificationTemplate';
import { Organization } from '../../frontend/awx/interfaces/Organization';
import { Project } from '../../frontend/awx/interfaces/Project';
import { Schedule } from '../../frontend/awx/interfaces/Schedule';
import { Spec, Survey } from '../../frontend/awx/interfaces/Survey';
import { WorkflowApproval } from '../../frontend/awx/interfaces/WorkflowApproval';
import { WorkflowJobTemplate } from '../../frontend/awx/interfaces/WorkflowJobTemplate';
import { WorkflowJobNode, WorkflowNode } from '../../frontend/awx/interfaces/WorkflowNode';
import { awxAPI } from './formatApiPathForAwx';
import { AwxRbacRole } from '../../frontend/awx/interfaces/AwxRbacRole';
import { ContentTypeEnum } from '../../frontend/awx/interfaces/ContentType';

//  AWX related custom command implementation

/* Custom Cypress command called `removeAllNodesFromVisualizerToolbar`.
This command removes all the nodes via the visualizer toolbar.
It verifies that the bulk remove modal is visible, clicks the confirm checkbox,
clicks the remove all nodes button, asserts all nodes were removed
successfully, and closes the modal.
*/
Cypress.Commands.add('removeAllNodesFromVisualizerToolbar', () => {
  cy.get('[data-cy="workflow-visualizer-toolbar-kebab"]').click();
  cy.get('[data-cy="workflow-visualizer-toolbar-remove-all"]').click();
  cy.clickModalConfirmCheckbox();
  cy.clickModalButton('Remove all steps');
  cy.assertModalSuccess();
  cy.clickModalButton('Close');
});

/* Custom Cypress command called `actionsWFApprovalConfirmModal`.
This command deletes a workflow approval request.
It verifies that the remove modal is visible, clicks the confirm checkbox,
clicks the delete workflow approvals, asserts all workflows were removed
successfully, and closes the modal.
*/
Cypress.Commands.add(
  'actionsWFApprovalConfirmModal',
  (action: 'approve' | 'deny' | 'cancel' | 'delete') => {
    const btnText: string = `${action} workflow approvals`;
    cy.log(btnText);
    // FIXME: header is present but the get always fails
    // cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
    //   cy.get('header').should('contain', btnText);
    // });
    cy.clickModalConfirmCheckbox();
    cy.get('#submit').click(); // FIXME: contains doesn't work for buttons inside the modal
    cy.assertModalSuccess();
    cy.clickModalButton('Close');
  }
);

/* The following code is adding a custom Cypress command called
`createAwxWorkflowVisualizerJobTemplateNode`. This command is used to create a new workflow job
template node in an AWX (Ansible Tower) instance. */
Cypress.Commands.add(
  'createAwxWorkflowVisualizerJobTemplateNode',
  (workflowJobTemplate: WorkflowJobTemplate, jobTemplateNode: JobTemplate) => {
    cy.requestPost<WorkflowNode>(
      awxAPI`/workflow_job_templates/${workflowJobTemplate?.id.toString()}/workflow_nodes/`,
      {
        unified_job_template: jobTemplateNode.id,
      }
    );
  }
);

/** The following code is adding a custom Cypress command called
`createAwxWorkflowVisualizerManagementNode`. This command is used to create a management job node for a workflow visualizer in an AWX (Ansible Controller) application.
@param {'1'|'2'|'3'|'4'} managementId - Id of the management job template
*/
Cypress.Commands.add(
  'createAwxWorkflowVisualizerManagementNode',
  (workflowJobTemplateId: WorkflowJobTemplate, managementId: 1 | 2 | 3 | 4) => {
    cy.requestPost<WorkflowNode>(
      awxAPI`/workflow_job_templates/${workflowJobTemplateId?.id.toString()}/workflow_nodes/`,
      {
        unified_job_template: managementId,
      }
    );
  }
);

/* The following code is adding a custom Cypress command called `createAwxWorkflowVisualizerWJTNode`. This
command is used to create a new workflow node for a given workflow job template. It makes a POST
request to the awxAPI`/workflow_job_templates/{id}/workflow_nodes/` endpoint with the necessary
data to create the node. */
Cypress.Commands.add(
  'createAwxWorkflowVisualizerWJTNode',
  (workflowJobTemplate: WorkflowJobTemplate) => {
    cy.requestPost<WorkflowNode>(
      awxAPI`/workflow_job_templates/${workflowJobTemplate?.id.toString()}/workflow_nodes/`,
      {
        unified_job_template: workflowJobTemplate?.id,
        limit: null,
        scm_branch: null,
      }
    );
  }
);

/* The following code is adding a custom Cypress command called `createAwxWorkflowVisualizerProjectNode`.
This command is used to create a new workflow node for a given `workflowJobTemplate` and `project`
in an AWX (Ansible Tower) environment. */
Cypress.Commands.add(
  'createAwxWorkflowVisualizerProjectNode',
  function (workflowJobTemplate: WorkflowJobTemplate, project: Project) {
    cy.requestPost<WorkflowNode>(
      awxAPI`/workflow_job_templates/${workflowJobTemplate?.id.toString()}/workflow_nodes/`,
      {
        unified_job_template: project.id,
      }
    );
  }
);

Cypress.Commands.add(
  'createAwxWorkflowVisualizerApprovalNode',
  (workflowJobTemplate: WorkflowJobTemplate) => {
    cy.requestPost<WorkflowNode>(
      awxAPI`/workflow_job_templates/${workflowJobTemplate?.id.toString()}/workflow_nodes/`,
      {}
    ).then((approvalNode) => {
      cy.requestPost(
        awxAPI`/workflow_job_template_nodes/${approvalNode.id.toString()}/create_approval_template/`,
        {
          name: 'E2E WorkflowJTApprovalNode ' + randomString(4),
        }
      ).then(() => {
        return approvalNode;
      });
    });
  }
);

/* The following code is adding a custom Cypress command called
`createAwxWorkflowVisualizerInventorySourceNode`. This command is used to create a workflow node for
an Ansible Tower workflow job template. The function takes two parameters: `workflowJobTemplate` (of
type `WorkflowJobTemplate`) and `inventorySource` (of type `InventorySource`). */
Cypress.Commands.add(
  'createAwxWorkflowVisualizerInventorySourceNode',
  function (workflowJobTemplate: WorkflowJobTemplate, inventorySource: InventorySource) {
    cy.requestPost<WorkflowNode>(
      awxAPI`/workflow_job_templates/${workflowJobTemplate?.id.toString()}/workflow_nodes/`,
      {
        unified_job_template: inventorySource.id,
        scm_branch: null,
        limit: null,
        job_tags: null,
        skip_tags: null,
      }
    );
  }
);

/* The following code is adding a custom Cypress command called `createWorkflowJTSuccessNodeLink`. This
command is used to create a link between two nodes in a workflow job template. It takes two
parameters, `firstNode` and `secondNode`, which are objects representing the first and second nodes
respectively. */
Cypress.Commands.add(
  'createWorkflowJTSuccessNodeLink',
  function (firstNode: WorkflowNode, secondNode: WorkflowNode) {
    cy.requestPost<WorkflowNode>(
      awxAPI`/workflow_job_template_nodes/${firstNode.id.toString()}/success_nodes/`,
      {
        id: secondNode.id,
      }
    );
  }
);

/* The following code is adding a custom Cypress command called `createWorkflowJTFailureNodeLink`. This
command is used to create a failure node link between two workflow job template nodes. It makes a
POST request to the awxAPI`/workflow_job_template_nodes/{firstNode.id}/failure_nodes/` endpoint
with the `id` of the second node as the request payload. */
Cypress.Commands.add(
  'createWorkflowJTFailureNodeLink',
  function (firstNode: WorkflowNode, secondNode: WorkflowNode) {
    cy.requestPost<WorkflowNode>(
      awxAPI`/workflow_job_template_nodes/${firstNode.id.toString()}/failure_nodes/`,
      {
        id: secondNode.id,
      }
    );
  }
);

//Always Node creation
Cypress.Commands.add(
  'createWorkflowJTAlwaysNodeLink',
  function (firstNode: WorkflowNode, secondNode: WorkflowNode) {
    cy.requestPost<WorkflowNode>(
      awxAPI`/workflow_job_template_nodes/${firstNode.id.toString()}/always_nodes/`,
      {
        id: secondNode.id,
      }
    );
  }
);

Cypress.Commands.add(
  'getFirstPendingWorkflowApprovalsForWorkflowJobID',
  (workflowJobID: number) => {
    cy.requestGet<AwxItemsResponse<WorkflowNode>>(
      awxAPI`/workflow_jobs/${workflowJobID.toString()}/workflow_nodes/`
    )
      .its('results')
      .then((workflowJobNodes: WorkflowJobNode[]) => {
        const workflowApprovalIds = workflowJobNodes
          .filter((node) => node.summary_fields.job?.type === 'workflow_approval')
          .filter((node) => node.summary_fields.job?.status === 'pending')
          .map((node) => node.summary_fields.job?.id);
        if (workflowApprovalIds.length === 0) return cy.then(() => undefined);
        const workflowApprovalId = workflowApprovalIds[0];
        return cy.requestGet<WorkflowApproval>(
          awxAPI`/workflow_approvals/${workflowApprovalId!.toString()}`
        );
      });
  }
);

Cypress.Commands.add(
  'pollFirstPendingWorkflowApprovalsForWorkflowJobID',
  (workflowJobID: number) => {
    cy.poll<WorkflowApproval>(
      () => cy.getFirstPendingWorkflowApprovalsForWorkflowJobID(workflowJobID),
      (approval: WorkflowApproval) => !!approval
    );
  }
);

Cypress.Commands.add('pollAWXResults', <T>(url: string) => {
  cy.requestGet<AwxItemsResponse<T>>(url).then((result) => {
    if (Array.isArray(result?.results) && result.results.length > 0) {
      cy.wrap(result.results);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
      cy.wait(100).then(() => cy.pollAWXResults(url));
    }
  });
});

Cypress.Commands.add('inputCustomCredTypeConfig', (configType: string, config: string) => {
  cy.get(`[data-cy="${configType}"]`)
    .find('textarea:not(:disabled)')
    .focus()
    .clear()
    .type('{selectAll}{backspace}')
    .type(`${config}`, {
      delay: 0,
      parseSpecialCharSequences: false,
    })
    .type('{esc}');
});

Cypress.Commands.add(
  'createAndDeleteCustomAWXCredentialTypeUI',
  (
    customCredTypeName: string,
    inputConfig?: string,
    injectorConfig?: string,
    defaultFormat?: string
  ) => {
    const credentialTypeDesc = 'This is a custom credential type that is not managed';
    cy.navigateTo('awx', 'credential-types');
    cy.clickLink(/^Create credential type$/);
    cy.verifyPageTitle('Create Credential Type');
    cy.url().then((currentUrl) => {
      expect(currentUrl.includes('/credential-types/create')).to.be.true;
    });
    cy.get('[data-cy="name"]').type(`${customCredTypeName}`);
    cy.get('[data-cy="description"]').type(`${credentialTypeDesc}`);
    if (inputConfig && injectorConfig) {
      if (defaultFormat === 'json') {
        cy.dataEditorSetFormat('inputs');
      }
      cy.inputCustomCredTypeConfig('inputs', inputConfig);
      if (defaultFormat === 'json') {
        cy.dataEditorSetFormat('injectors');
      }
      cy.inputCustomCredTypeConfig('injectors', injectorConfig);
    }
    cy.clickButton(/^Create credential type$/);
    cy.verifyPageTitle(customCredTypeName);
    cy.hasDetail(/^Name$/, `${customCredTypeName}`);
    cy.hasDetail(/^Description$/, `${credentialTypeDesc}`);
    cy.clickPageAction('delete-credential-type');
    cy.get('#confirm').click();
    cy.clickButton(/^Delete credential type/);
  }
);

Cypress.Commands.add('dataEditorSetFormat', (dataCy: string, format: 'json' | 'yaml' = 'json') => {
  cy.get(`[data-cy="${dataCy}-form-group"] [data-cy=toggle-${format}]`).click();
});

Cypress.Commands.add('assertMonacoTextField', (textString: string) => {
  cy.get('[data-cy="variables"] code').should('contain', textString);
});

Cypress.Commands.add('dataEditorShouldContain', (selector: string, value: string | object) => {
  let yaml: string;
  if (typeof value === 'string') {
    yaml = value;
  } else {
    if (Object.keys(value).length === 0) {
      yaml = '';
    } else {
      yaml = jsyaml.dump(value);
    }
  }
  cy.get(selector).within(() => {
    for (const line of yaml.split('\n')) {
      if (line.trim() === '') continue;
      cy.contains(line.trim()).should('be.visible');
    }
  });
});

Cypress.Commands.add('selectPromptOnLaunch', (resourceName: string) => {
  cy.get(`[data-cy="ask_${resourceName}_on_launch"]`).click();
});

Cypress.Commands.add('selectItemFromLookupModal', (resource: string, itemName: string) => {
  cy.get(`[data-cy*="${resource}-form-group"]`).within(() => {
    cy.get('button').eq(1).click();
  });
  cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
    cy.searchAndDisplayResource(itemName);
    cy.get('[data-ouia-component-id="simple-table"] tbody').within(() => {
      cy.get('[data-cy="checkbox-column-cell"] input').click();
    });
    cy.clickButton(/^Confirm/);
  });
});

Cypress.Commands.add('selectDropdownOptionByResourceName', (resource: string, itemName: string) => {
  const menuSelector = `[data-cy*="${resource}-form-group"] div[data-ouia-component-id="menu-select"]`;
  cy.get('[data-cy="loading-spinner"]').should('not.exist');
  cy.get(`${menuSelector}`)
    .find('svg[data-cy="lookup-button"]', { timeout: 1000 })
    .should((_) => {})
    .then(($elements) => {
      if ($elements.length) {
        cy.get(`${menuSelector}`).find('svg[data-cy="lookup-button"]').click();
        cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
          //wait for table to load
          cy.get('table').should('exist');
          cy.filterTableBySingleSelect('name', itemName);
          cy.get('tbody tr input').click();
          cy.clickButton('Confirm');
        });
      } else {
        cy.get(`${menuSelector} button`)
          .click()
          .then(() => {
            cy.contains('li', itemName).click();
          });
      }
    });
});

Cypress.Commands.add('clickLink', (label: string | RegExp) => {
  cy.containsBy('a', label).click();
});

Cypress.Commands.add('clickTab', (label: string | RegExp, isLink) => {
  if (isLink) {
    cy.contains('a[role="tab"]', label).click();
  } else {
    cy.contains('button[role="tab"]', label).click();
  }
});

Cypress.Commands.add('clickButton', (label: string | RegExp) => {
  cy.containsBy('button', label).click();
});

Cypress.Commands.add('navigateTo', (component: string, label: string) => {
  cy.get('[data-cy="page-navigation"]').then((nav) => {
    if (nav.is(':visible')) {
      cy.get(`[data-cy="${component}-${label}"]`).click({ force: true });
    } else {
      cy.get('[data-cy="nav-toggle"]').click();
      cy.get(`[data-cy="${component}-${label}"]`).click({ force: true });
    }
  });
  cy.clearAllFilters();
  cy.get('[data-cy="refresh"]').click();
});

Cypress.Commands.add('verifyPageTitle', (label: string) => {
  cy.get(`[data-cy="page-title"]`).should('contain', label);
});

Cypress.Commands.add('hasAlert', (label: string | RegExp) => {
  cy.contains('[data-cy="alert-toaster"]', label);
});

Cypress.Commands.add('hasTooltip', (label: string | RegExp) => {
  cy.contains('.pf-v5-c-tooltip__content', label);
});

Cypress.Commands.add('clickToolbarKebabAction', (dataCy: string) => {
  cy.getBy('[data-ouia-component-id="page-toolbar"]').within(() => {
    cy.getByDataCy('actions-dropdown').click();
    cy.document()
      .its('body')
      .find('.pf-v5-c-menu__content')
      .within(() => {
        cy.getByDataCy(dataCy).click();
      });
  });
});

Cypress.Commands.add('clickTableRow', (name: string | RegExp, filter?: boolean) => {
  cy.getTableRowByText(name, filter).within(() => {
    cy.contains('td', name).within(() => {
      cy.getBy('a').click();
    });
  });
});

Cypress.Commands.add(
  'getTableRowByText',
  (name: string | RegExp, filter?: boolean, variant?: 'MultiText' | 'SingleText') => {
    if (filter !== false && typeof name === 'string') {
      cy.filterTableByText(name, variant ?? 'MultiText');
    }
    cy.contains('tr', name);
  }
);

Cypress.Commands.add('getTableRowBySingleText', (name: string | RegExp, filter?: boolean) => {
  cy.getTableRowByText(name, filter, 'SingleText');
});

Cypress.Commands.add('selectDetailsPageKebabAction', (dataCy: string) => {
  cy.get('[data-cy="actions-dropdown"]')
    .click()
    .then(() => {
      cy.getByDataCy(`${dataCy}`).click();
      cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
        cy.get('[data-ouia-component-id="confirm"]').click();
        cy.get('[data-ouia-component-id="submit"]').click();
      });
    });
});

Cypress.Commands.add(
  'clickTableRowKebabAction',
  (name: string | RegExp, dataCyLabel: string, filter?: boolean) => {
    cy.getTableRowByText(name, filter).within(() => {
      cy.get('[data-cy*="actions-dropdown"]')
        .click()
        .then(() => {
          cy.getByDataCy(dataCyLabel).click();
        });
    });
  }
);

Cypress.Commands.add('clickListCardKebabAction', (id: number, dataCyLabel: string) => {
  cy.get(`[data-ouia-component-id="${id}"]`).within(() => {
    cy.get('[data-cy*="actions-dropdown"]').click();
    cy.document()
      .its('body')
      .find('.pf-v5-c-menu__content')
      .within(() => {
        cy.getByDataCy(dataCyLabel).click();
      });
  });
});

Cypress.Commands.add(
  'clickTableRowPinnedAction',
  (name: string | RegExp, iconDataCy: string, filter?: boolean) => {
    cy.getTableRowByText(name, filter).within(() => {
      cy.getByDataCy('actions-column-cell').within(() => {
        cy.getByDataCy(iconDataCy).click();
      });
    });
  }
);

Cypress.Commands.add('selectTableRow', (name: string | RegExp, filter?: boolean) => {
  cy.getTableRowByText(name, filter).within(() => {
    cy.get('input[type=checkbox]').click();
  });
});

Cypress.Commands.add('expandTableRow', (name: string | RegExp, filter?: boolean) => {
  cy.getTableRowByText(name, filter).within(() => {
    cy.get('[data-cy="expand-column-cell"]').click();
  });
});

Cypress.Commands.add(
  'hasDetail',
  (detailTerm: string | RegExp, detailDescription: string | RegExp) => {
    cy.contains('dt', detailTerm).next().should('contain', detailDescription);
  }
);

Cypress.Commands.add('clickModalButton', (label: string | RegExp) => {
  cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
    cy.clickButton(label);
  });
});

Cypress.Commands.add('clickModalConfirmCheckbox', () => {
  cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
    cy.get('input[id="confirm"]').click();
  });
});

Cypress.Commands.add('assertModalSuccess', () => {
  cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
    cy.get('tbody>tr')
      .find('[data-label="Status"]')
      .each(($li) => {
        cy.wrap($li).should('contain', 'Success');
      });
  });
});

Cypress.Commands.add('clickPageAction', (dataCy: string) => {
  cy.getByDataCy('actions-dropdown').click();
  cy.getByDataCy(dataCy).click();
});

Cypress.Commands.add(
  'createAWXCredential',
  (credential: SetRequired<Partial<Credential>, 'organization' | 'kind' | 'credential_type'>) => {
    cy.requestPost<
      SetRequired<Partial<Credential>, 'organization' | 'kind' | 'credential_type'>,
      Credential
    >(awxAPI`/credentials/`, {
      name: 'E2E Credential ' + randomString(4),
      ...credential,
    });
  }
);

Cypress.Commands.add(
  'deleteAwxCredential',
  (
    credential: Credential,
    options?: {
      failOnStatusCode?: boolean;
    }
  ) => {
    cy.requestDelete(awxAPI`/credentials/${credential.id.toString()}/`, options);
  }
);

Cypress.Commands.add('createAwxCredentialType', () => {
  cy.requestPost<Pick<CredentialType, 'name' | 'description' | 'kind'>, CredentialType>(
    awxAPI`/credential_types/`,
    {
      name: 'E2E Custom Credential Type ' + randomString(4),
      description: 'E2E Custom Credential Type Description',
      kind: 'cloud',
    }
  );
});

Cypress.Commands.add(
  'deleteAwxCredentialType',
  (
    credentialType: CredentialType,
    options?: {
      /** Whether to fail on response codes other than 2xx and 3xx */
      failOnStatusCode?: boolean;
    }
  ) => {
    if (credentialType?.id) {
      cy.requestDelete(awxAPI`/credential_types/${credentialType.id.toString()}`, options);
    }
  }
);

Cypress.Commands.add(
  'getAwxRoles',
  (queryParams?: { content_type__model?: string; managed?: boolean }) => {
    let roleDefinitionsUrl = awxAPI`/role_definitions/?order_by=name`;
    if (queryParams) {
      const { content_type__model, managed } = queryParams;
      roleDefinitionsUrl = content_type__model
        ? (roleDefinitionsUrl += `&content_type__model=${content_type__model}`)
        : roleDefinitionsUrl;
      roleDefinitionsUrl =
        managed !== undefined ? (roleDefinitionsUrl += `&managed=${managed}`) : roleDefinitionsUrl;
    }

    cy.requestGet<AwxItemsResponse<AwxRbacRole>>(roleDefinitionsUrl).then((response) => {
      return response;
    });
  }
);

Cypress.Commands.add('getAwxRoleDetail', (roleID: string) => {
  cy.requestGet<AwxRbacRole>(`/api/controller/v2/role_definitions/${roleID}/`);
});

Cypress.Commands.add(
  'createAwxRole',
  (roleName: string, description: string, content_type, permissions: string[]) => {
    cy.requestPost<AwxRbacRole>(awxAPI`/role_definitions/`, {
      name: roleName,
      description: description,
      content_type: content_type as ContentTypeEnum,
      permissions: permissions,
    }).then(() => {
      Cypress.log({
        displayName: 'AWX Role :',
      });
    });
  }
);

Cypress.Commands.add('deleteAwxRole', (awxRoleDefinition: AwxRbacRole) => {
  cy.requestDelete(awxAPI`/role_definitions/${awxRoleDefinition.id.toString()}/`, {
    failOnStatusCode: false,
  }).then(() => {
    Cypress.log({
      displayName: 'AWX ROLE DELETION :',
      message: [`Deleted 👉  ${awxRoleDefinition.name}`],
    });
  });
});

Cypress.Commands.add(
  'createAwxProject',
  (
    organization: Organization,
    project?: Partial<Project>,
    scm_url?: string,
    skipSync?: boolean
  ) => {
    cy.requestPost<Project>(awxAPI`/projects/`, {
      name: 'E2E Project ' + randomString(4),
      organization: organization.id,
      scm_type: 'git',
      scm_url: scm_url ? scm_url : 'https://github.com/ansible/ansible-ui',
      ...project,
    }).then((project) => {
      if (!skipSync) {
        cy.waitForProjectToFinishSyncing(project.id);
      } else {
        cy.wrap(project);
      }
    });
  }
);

Cypress.Commands.add('waitForProjectToFinishSyncing', (projectId: number) => {
  let requestCount = 1;
  let initialWaitTime = 1000;
  const maxRequestCount = 300;

  cy.requestGet<Project>(awxAPI`/projects/${projectId.toString()}`).then((project) => {
    // Assuming that projects could take up to 5 min to sync if the instance is under load with other jobs
    if (project.status === 'successful' || requestCount > maxRequestCount) {
      if (requestCount > maxRequestCount) {
        cy.log('Reached maximum number of requests for reading project status');
      }
      // Reset request count
      requestCount = 1;
      return;
    }
    Cypress.log({
      displayName: `PROJECT SYNC: ${project.name} status ${project.status}`,
      message: [`🕓WAITING FOR PROJECT TO SYNC...🕓`],
    });
    requestCount++;
    if (requestCount <= 5) {
      initialWaitTime = initialWaitTime * 2;
    } else {
      initialWaitTime = 1000;
    }
    cy.wait(initialWaitTime);
    cy.waitForProjectToFinishSyncing(projectId);
  });
});

Cypress.Commands.add(
  'createAwxExecutionEnvironment',
  (execution_environment?: Partial<Omit<ExecutionEnvironment, 'id'>>) => {
    cy.requestPost<Partial<Omit<ExecutionEnvironment, 'id'>>, ExecutionEnvironment>(
      awxAPI`/execution_environments/`,
      {
        name: 'E2E Execution Environment ' + randomString(4),
        image: 'executionenvimage',
        ...execution_environment,
      }
    );
  }
);

Cypress.Commands.add(
  'deleteAwxExecutionEnvironment',
  (
    execution_environment: ExecutionEnvironment,
    options?: {
      /** Whether to fail on response codes other than 2xx and 3xx */
      failOnStatusCode?: boolean;
    }
  ) => {
    if (execution_environment.id) {
      cy.requestDelete(
        awxAPI`/execution_environments/${execution_environment.id.toString()}/`,
        options
      );
    }
  }
);

Cypress.Commands.add(
  'deleteAwxProject',
  (
    project: Project,
    options?: {
      /** Whether to fail on response codes other than 2xx and 3xx */
      failOnStatusCode?: boolean;
    }
  ) => {
    // Delete sync job related to project
    if (project && project.related && typeof project.related.last_job === 'string') {
      const projectUpdateEndpoint: string = project.related.last_job;
      cy.requestDelete(projectUpdateEndpoint, options);
    }
    cy.requestDelete(awxAPI`/projects/${project.id.toString()}/`, options);
  }
);

Cypress.Commands.add(
  'createAwxInventory',
  (organization: Organization, inventory?: Partial<Inventory>) => {
    cy.requestPost<Inventory>(awxAPI`/inventories/`, {
      name: 'E2E Inventory ' + randomString(4),
      organization: organization.id,
      ...inventory,
    });
  }
);

Cypress.Commands.add(
  'createAwxConstructedInventory',
  (
    organization: Organization,
    params?: { source_vars?: boolean; input_inventory_count?: number }
  ) => {
    const arrayOfInventories: number[] = [];
    // creates 3 inventories
    const count = params?.input_inventory_count ? params.input_inventory_count : 3;
    for (let i = 0; i < count; i++) {
      cy.createAwxInventory(organization).then((inv: Inventory) => {
        arrayOfInventories.push(inv.id);
      });
    }

    const postData: Partial<Inventory & { inventories: Array<number | undefined> }> = {
      name: `E2E Constructed Inventory ${randomString(4)}`,
      organization: organization.id,
      kind: 'constructed',
      inventories: arrayOfInventories,
    };

    if (params?.source_vars) {
      postData.source_vars = 'plugin: test';
    } else {
      postData.variables = 'plugin: test';
    }

    cy.requestPost<Partial<Inventory & { inventories: Array<number | undefined> }>>(
      awxAPI`/constructed_inventories/`,
      postData
    ).then((constructedInv: Partial<Inventory>) => {
      const inputInvPromises = arrayOfInventories.map((invID) => {
        cy.requestPost(awxAPI`/inventories/${String(constructedInv.id)}/input_inventories/`, {
          id: invID,
        });
      });
      const resolvePromise = Promise.all(inputInvPromises).then((_res) => {
        cy.requestPost(
          awxAPI`/inventories/${String(constructedInv.id)}/update_inventory_sources/`,
          {}
        ).then((_res) => {
          return constructedInv;
        });
      });
      return resolvePromise;
    });
  }
);

Cypress.Commands.add(
  'createAwxInventorySource',
  (inventory: Partial<Pick<Inventory, 'id'>>, project: Partial<Pick<Project, 'id'>>) => {
    cy.requestPost(awxAPI`/inventory_sources/`, {
      name: 'E2E Inventory Source ' + randomString(4),
      description: 'This is a description',
      source: 'scm',
      source_project: project.id,
      source_path: '',
      inventory: inventory.id,
    });
  }
);

Cypress.Commands.add(
  'deleteAwxInventory',
  (
    inventory: Inventory,
    options?: {
      /** Whether to fail on response codes other than 2xx and 3xx */
      failOnStatusCode?: boolean;
    }
  ) => {
    cy.requestDelete(awxAPI`/inventories/${inventory.id.toString()}/`, options);
  }
);

Cypress.Commands.add(
  'deleteAwxConstructedInventory',
  (
    constructedInv: Inventory,
    options?: {
      /** Whether to fail on response codes other than 2xx and 3xx */
      failOnStatusCode?: boolean;
    }
  ) => {
    cy.requestGet<AwxItemsResponse<Inventory>>(
      awxAPI`/inventories/${constructedInv.id.toString()}/input_inventories/`
    )
      .its('results')
      .then((inputInv: Inventory[]) => {
        const inputInvPromises = inputInv.map((inv) => {
          cy.requestDelete(awxAPI`/inventories/${inv.id.toString()}/`, options);
        });
        const resolvePromise = Promise.all(inputInvPromises).then((_res) => {
          cy.requestDelete(awxAPI`/inventories/${constructedInv.id.toString()}/`, options);
        });
        return resolvePromise;
      });
  }
);

Cypress.Commands.add(
  'deleteAwxInventorySource',
  (
    inventorySource: InventorySource,
    options?: {
      /** Whether to fail on response codes other than 2xx and 3xx */
      failOnStatusCode?: boolean;
    }
  ) => {
    cy.requestDelete(awxAPI`/inventory_sources/${inventorySource.id.toString()}/`, options);
  }
);

Cypress.Commands.add('createAWXSchedule', (schedule?: Partial<Schedule>) => {
  cy.requestPost<Schedule>(
    awxAPI`/schedules/`,
    schedule ?? {
      name: 'E2E Schedule ' + randomString(4),
      description: 'E2E Schedule Description',
      enabled: true,
      rrule: 'DTSTART:20201231T000000Z RRULE:FREQ=DAILY;INTERVAL=1;COUNT=1',
      unified_job_template: 1,
      extra_data: {},
    }
  ).then((schedule) => schedule);
});

Cypress.Commands.add(
  'deleteAWXSchedule',
  (
    schedule: Schedule,
    options?: {
      /** Whether to fail on response codes other than 2xx and 3xx */

      failOnStatusCode?: boolean;
    }
  ) => {
    cy.requestDelete(awxAPI`/schedules/${schedule.id.toString()}/`, options);
  }
);

/** Interface for tracking created resources that will need to be delete
at the end of testing using cy.deleteAwxResources*/
export interface IAwxResources {
  jobTemplate?: JobTemplate;
}

Cypress.Commands.add(
  'deleteAwxResources',
  (
    resources?: IAwxResources,
    options?: {
      /** Whether to fail on response codes other than 2xx and 3xx */

      failOnStatusCode?: boolean;
    }
  ) => {
    if (resources?.jobTemplate) cy.deleteAwxJobTemplate(resources.jobTemplate, options);
  }
);

Cypress.Commands.add(
  'createAwxJobTemplate',
  (
    jobTemplate: SetRequired<
      Partial<Omit<JobTemplate, 'id'>>,
      'organization' | 'project' | 'inventory'
    >,
    playbook?: string,
    instanceGroup?: InstanceGroup
  ) => {
    cy.requestPost<
      SetRequired<Partial<Omit<JobTemplate, 'id'>>, 'organization' | 'project' | 'inventory'>,
      JobTemplate
    >(awxAPI`/job_templates/`, {
      name: 'E2E Job Template ' + randomString(4),
      playbook: playbook ? playbook : 'playbooks/hello_world.yml',
      ...jobTemplate,
    }).then((jt: Partial<JobTemplate>) => {
      if (instanceGroup) {
        if (jt.id) {
          cy.requestPost(awxAPI`/job_templates/${jt.id.toString()}/instance_groups/`, {
            id: instanceGroup.id,
          });
        }
      }
      return new Promise((resolve, _reject) => resolve(jt));
    });
  }
);

Cypress.Commands.add(
  'createAwxWorkflowJobTemplate',
  (workflowJobTemplate: Partial<WorkflowJobTemplate>) => {
    cy.requestPost<WorkflowJobTemplate>(awxAPI`/workflow_job_templates/`, {
      name: 'E2E WorkflowJob Template ' + randomString(4),
      ...workflowJobTemplate,
    });
  }
);

Cypress.Commands.add(
  'createAwxSurvey',
  (surveySpec: Partial<Survey>, template: Partial<JobTemplate | WorkflowJobTemplate>) => {
    return cy.requestPost<Survey>(`${template.url}survey_spec/`, {
      ...surveySpec,
    });
  }
);

Cypress.Commands.add('getAwxWorkflowJobTemplateByName', (awxWorkflowJobTemplateName: string) => {
  cy.requestGet<AwxItemsResponse<WorkflowJobTemplate>>(
    awxAPI`/workflow_job_templates/?name=${awxWorkflowJobTemplateName}`
  );
});

Cypress.Commands.add(
  'renderWorkflowVisualizerNodesFromFixtureFile',
  (workflowJobTemplateName: string, fixtureFile: string) => {
    cy.getAwxWorkflowJobTemplateByName(workflowJobTemplateName)
      .its('results[0]')
      .then((results: WorkflowJobTemplate) => {
        cy.intercept(
          {
            method: 'GET',
            url: awxAPI`/workflow_job_templates/${results.id.toString()}/workflow_nodes/*`,
          },
          { fixture: fixtureFile }
        )
          .as('newVisualizerView')
          .then(() => {
            cy.navigateTo('awx', 'templates');
            cy.filterTableByMultiSelect('name', [results.name]);
            cy.clickTableRowLink('name', results.name, { disableFilter: true });
            cy.get('a[href*="/visualizer"]').click();
          });
      });
  }
);

Cypress.Commands.add(
  'deleteAwxWorkflowJobTemplate',
  (
    workflowJobTemplate: WorkflowJobTemplate,
    options?: {
      /** Whether to fail on response codes other than 2xx and 3xx */
      failOnStatusCode?: boolean;
    }
  ) => {
    if (workflowJobTemplate.id) {
      const workflowTemplateId =
        typeof workflowJobTemplate.id === 'number' ? workflowJobTemplate.id.toString() : '';
      cy.requestDelete(awxAPI`/workflow_job_templates/${workflowTemplateId}/`, options);
    }
  }
);

Cypress.Commands.add(
  'deleteAwxJobTemplate',
  (
    jobTemplate: JobTemplate,
    options?: {
      /** Whether to fail on response codes other than 2xx and 3xx */
      failOnStatusCode?: boolean;
    }
  ) => {
    if (jobTemplate.id) {
      const templateId = typeof jobTemplate.id === 'number' ? jobTemplate.id.toString() : '';
      cy.requestDelete(awxAPI`/job_templates/${templateId}/`, options);
    }
  }
);

Cypress.Commands.add(
  'deleteAwxJob',
  (
    job: Job,
    options?: {
      /** Whether to fail on response codes other than 2xx and 3xx */
      failOnStatusCode?: boolean;
    }
  ) => {
    if (job.id) {
      const jobId = typeof job.id === 'number' ? job.id.toString() : '';
      cy.requestDelete(awxAPI`/jobs/${jobId}/`, options);
    }
  }
);

Cypress.Commands.add(
  'createInventoryHost',
  function createInventoryHost(organization: Organization, kind: '' | 'constructed' | 'smart') {
    cy.requestPost<Partial<Inventory>>(awxAPI`/inventories/`, {
      name: `E2E Regular Inventory ${randomString(4)}`,
      organization: organization.id,
    }).then((inventory: Partial<Inventory>) => {
      cy.requestPost<Partial<AwxHost>, AwxHost>(awxAPI`/hosts/`, {
        name: 'E2E Host ' + randomString(4),
        inventory: inventory.id,
      }).then((host) => {
        if (kind === 'constructed') {
          cy.requestPost<Partial<Inventory & { inventories: Array<number | undefined> }>>(
            awxAPI`/constructed_inventories/`,
            {
              name: `E2E Constructed Inventory ${randomString(4)}`,
              organization: organization.id,
              kind: 'constructed',
              inventories: [inventory.id],
              variables: 'plugin: test',
            }
          ).then((constructedInv: Partial<Inventory>) => {
            cy.requestPost(awxAPI`/inventories/${String(constructedInv.id)}/input_inventories/`, {
              id: inventory.id,
            })
              .then((_res) => {
                cy.requestPost(
                  awxAPI`/inventories/${String(constructedInv.id)}/update_inventory_sources/`,
                  {}
                );
              })
              .then((_res) => {
                const inventory = constructedInv;
                return { inventory, host };
              });
          });
        }
        if (kind === 'smart') {
          cy.requestPost<Partial<Inventory>>(awxAPI`/inventories/`, {
            name: `E2E Smart Inventory ${randomString(4)}`,
            organization: organization.id,
            kind: 'smart',
            host_filter: `name__icontains=E2E`,
          }).then((smartInv) => {
            const inventory = smartInv;
            return { inventory, host };
          });
        }
        if (kind === '') {
          return new Promise((resolve, _reject) => resolve({ inventory, host }));
        }
      });
    });
  }
);

Cypress.Commands.add(
  'createInventoryHostGroup',
  function createInventoryHostGroup(organization: Organization) {
    cy.requestPost<Partial<Inventory>>(awxAPI`/inventories/`, {
      name: 'E2E Inventory ' + randomString(4),
      organization: organization.id,
    }).then((inventory) => {
      cy.requestPost<AwxHost, Partial<AwxHost>>(awxAPI`/hosts/`, {
        name: 'E2E Host ' + randomString(4),
        inventory: inventory.id,
      }).then((host) => {
        cy.requestPost<{ name: string; inventory: number }>(
          awxAPI`/hosts/${host.id.toString()}/groups/`,
          {
            name: 'E2E Group ' + randomString(4),
            inventory: host.inventory,
          }
        ).then((group) => ({
          inventory,
          host,
          group,
        }));
      });
    });
  }
);

Cypress.Commands.add('createInventoryGroup', (inventory: Inventory, groupName: string) => {
  cy.requestPost<Partial<InventoryGroup>, InventoryGroup>(awxAPI`/groups/`, {
    name: groupName,
    inventory: inventory.id,
  });
});

Cypress.Commands.add('createAwxLabel', (label: Partial<Omit<Label, 'id'>>) => {
  cy.requestPost<Partial<Omit<Label, 'id'>>, Label>(awxAPI`/labels/`, {
    name: 'E2E Label ' + randomString(4),
    ...label,
  });
});

Cypress.Commands.add(
  'deleteAwxLabel',
  (
    label?: Label,
    options?: {
      /** Whether to fail on response codes other than 2xx and 3xx */
      failOnStatusCode?: boolean;
    }
  ) => {
    const labelId = label?.id;
    if (labelId) {
      cy.requestDelete(awxAPI`/labels/${labelId.toString()}/`, options);
    }
  }
);

Cypress.Commands.add('createAwxInstanceGroup', (instanceGroup?: Partial<InstanceGroup>) => {
  cy.requestPost<InstanceGroup>(
    awxAPI`/instance_groups/`,
    instanceGroup ?? {
      name: 'E2E Instance Group ' + randomString(4),
      percent_capacity_remaining: 100,
      policy_instance_minimum: 0,
    }
  ).then((instanceGroup) => instanceGroup);
});

Cypress.Commands.add('getAwxInstanceGroupByName', (instanceGroupName: string) => {
  cy.requestGet<AwxItemsResponse<InstanceGroup>>(
    awxAPI`/instance_groups/?name=${instanceGroupName}`
  );
});

Cypress.Commands.add(
  'deleteAwxInstanceGroup',
  (
    instanceGroup: InstanceGroup,
    options?: {
      /** Whether to fail on response codes other than 2xx and 3xx */
      failOnStatusCode?: boolean;
    }
  ) => {
    if (instanceGroup?.id) {
      cy.requestDelete(awxAPI`/instance_groups/${instanceGroup.id.toString()}/`, options);
    }
  }
);

Cypress.Commands.add('createAwxToken', (awxToken?: Partial<AwxToken>) => {
  const url = awxAPI`/tokens/`;
  const body = { ...awxToken };
  return cy.requestPost<AwxToken>(url, body);
});

Cypress.Commands.add(
  'deleteAwxToken',
  (
    awxToken: AwxToken,
    options?: {
      /** Whether to fail on response codes other than 2xx and 3xx */
      failOnStatusCode?: boolean;
    }
  ) => {
    cy.requestDelete(awxAPI`/tokens/${awxToken.id.toString()}/`, options);
  }
);

// Global variable to store the token for AWX
// Created on demand when a command needs it
let globalAwxToken: AwxToken | undefined;

after(() => {
  // Delete the token if it was created
  if (globalAwxToken) cy.deleteAwxToken(globalAwxToken, { failOnStatusCode: false });
});

Cypress.Commands.add('waitForTemplateStatus', (jobID: string) => {
  cy.requestGet<AwxItemsResponse<JobEvent>>(
    awxAPI`/jobs/${jobID}/job_events/?order_by=counter&page=1&page_size=50`
  )
    .its('results')
    .then((results: { summary_fields: { job: { status: string } } }[]) => {
      if (results.length > 0) {
        return results[0].summary_fields.job.status;
      }
      return '';
    })
    .then((status: string) => {
      cy.log(status);
      switch (status) {
        case 'failed':
        case 'successful':
          cy.wrap(status);
          break;
        default:
          cy.wait(100).then(() => cy.waitForTemplateStatus(jobID));
          break;
      }
    });
});

Cypress.Commands.add('waitForManagementJobToProcess', (jobID: string, retries = 45) => {
  cy.requestGet<Job>(awxAPI`/system_jobs/${jobID}/`).then((mgtJobResponse: Job) => {
    let stillProcessing = false;

    if (mgtJobResponse) {
      const status = mgtJobResponse.status;
      // Check if job is still processing
      switch (status) {
        case 'failed':
        case 'successful':
          cy.log('management job launch status: ' + status);
          cy.wrap(status);
          break;
        default:
          stillProcessing = true;
          break;
      }
      // Check if job is still processing events
      if (!mgtJobResponse.event_processing_finished) {
        stillProcessing = true;
      }
    }
    if (stillProcessing) {
      if (retries > 0) {
        cy.wait(1000).then(() => cy.waitForManagementJobToProcess(jobID, retries - 1));
      } else {
        cy.log('Wait for job to process events timed out.');
      }
    } else {
      cy.log(`Wait for job to process events success.`);
    }
  });
});

Cypress.Commands.add('waitForJobToProcessEvents', (jobID: string, type, retries = 45) => {
  /* default retries = 1s * 30s for processing events  * 1.5 for good measure */
  if (!type) {
    type = 'jobs';
  }
  cy.requestGet<Job>(awxAPI`/${type.toString()}/${jobID}/`).then((job) => {
    let stillProcessing = false;

    if (job) {
      // Check if job is still processing
      switch (job.status) {
        case 'failed':
        case 'successful':
        case 'canceled':
          break;
        default:
          stillProcessing = true;
          break;
      }

      // Check if job is still processing events
      if (!job.event_processing_finished) {
        stillProcessing = true;
      }
    }

    if (stillProcessing) {
      if (retries > 0) {
        cy.wait(1000).then(() => cy.waitForJobToProcessEvents(jobID, type, retries - 1));
      } else {
        cy.log('Wait for job to process events timed out.');
      }
    } else {
      cy.log(`Wait for job to process events success.`);
    }
  });
});

Cypress.Commands.add('waitForWorkflowJobStatus', (jobID: string) => {
  const waitForWFJobStatus = (maxLoops: number) => {
    if (maxLoops === 0) {
      cy.log('Max loops reached while waiting for processing events.');
      cy.cancelJob({ url: awxAPI`/workflow_jobs/${jobID}/` } as Job);
      return;
    }
    cy.wait(500);

    cy.requestGet<Job>(awxAPI`/workflow_jobs/${jobID}/`)
      .its('status')
      .then((status) => {
        if (status === 'running' || status === 'pending') {
          cy.log(`WORKFLOW JOB STATUS = ${status}`);
          cy.log(`MAX LOOPS RAN = ${maxLoops}`);
          waitForWFJobStatus(maxLoops - 1);
        } else {
          cy.log(`WORKFLOW JOB STATUS = ${status as string}`);
        }
      });
  };
  waitForWFJobStatus(200);
});

Cypress.Commands.add('cancelJob', (job: Job) => {
  cy.requestPost<Job>(`${job.url}cancel/`, {});
});

Cypress.Commands.add(
  'createCustomAWXApplicationFromUI',
  (
    customAppName: string,
    customAppDescription: string,
    customGrantType: string,
    customClientType: string,
    customRedirectURIS: string
  ) => {
    cy.clickButton('Create application');
    cy.verifyPageTitle('Create Application');
    cy.get('[data-cy="name"]').type(customAppName);
    cy.get('[data-cy="description"]').type(customAppDescription);
    cy.selectSingleSelectOption('[data-cy="organization"]', 'Default');
    cy.selectDropdownOptionByResourceName('authorization-grant-type', customGrantType);
    cy.selectDropdownOptionByResourceName('client-type', customClientType);
    cy.get('[data-cy="redirect-uris"]').type(customRedirectURIS);
    cy.intercept('POST', awxAPI`/applications/`).as('createApp');
    cy.clickButton('Create application');
    //Verify API call
    cy.wait('@createApp')
      .its('response.statusCode')
      .then((statusCode: string) => {
        expect(statusCode).to.eql(201);
      });
    cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
      cy.get('header').contains('Application information');
    });
    cy.get('button[aria-label="Close"]').click();
  }
);

Cypress.Commands.add(
  'editCustomAWXApplicationFromDetailsView',
  (
    customAppName: string,
    customGrantType: string,
    customClientType: string,
    newCustomClientType: string
  ) => {
    //Verify application details page
    cy.verifyPageTitle(customAppName);
    cy.get('[data-cy="name"]').should('contain', customAppName);
    cy.get('[data-cy="organization"]').should('contain', 'Default');
    cy.get('[data-cy="authorization-grant-type"]').should(
      'contain',
      customGrantType === 'Authorization code'
        ? 'authorization-code'
        : customGrantType.toLowerCase()
    );
    cy.get('[data-cy="client-type"]').should('contain', customClientType.toLowerCase());
    //Click on Edit application button
    cy.clickButton('Edit application');
    cy.intercept('PATCH', awxAPI`/applications/*/`).as('editApp');
    cy.selectDropdownOptionByResourceName('client-type', newCustomClientType);
    cy.clickButton('Save application');
    //Verify API call
    cy.wait('@editApp')
      .its('response.body.client_type')
      .then((client_type: string) => {
        expect(newCustomClientType.toLowerCase()).to.be.equal(client_type);
      });
    //Verify changes
    cy.get('[data-cy="client-type"]').should('contain', newCustomClientType.toLowerCase());
  }
);

Cypress.Commands.add(
  'editCustomAWXApplicationFromListView',
  (customAppName: string, customGrantType: string, newCustomClientType: string) => {
    //Go back to list view
    cy.clickTab(/^Back to Applications$/, true);
    cy.verifyPageTitle('OAuth Applications');
    //Filter by app name
    cy.searchAndDisplayResource(customAppName);
    cy.get(`[data-cy="edit-application"]`).click();
    cy.intercept('PATCH', awxAPI`/applications/*/`).as('editApp');
    cy.selectDropdownOptionByResourceName('client-type', newCustomClientType);
    cy.clickButton('Save application');
    //Verify API call
    cy.wait('@editApp')
      .its('response.body.client_type')
      .then((client_type: string) => {
        expect(newCustomClientType.toLowerCase()).to.be.equal(client_type);
      });
    //Verify changes
    cy.get('[data-cy="name"]').should('contain', customAppName);
    cy.get('[data-cy="organization"]').should('contain', 'Default');
    cy.get('[data-cy="authorization-grant-type"]').should('contain', customGrantType.toLowerCase());
    cy.get('[data-cy="client-type"]').should('contain', newCustomClientType.toLowerCase());
  }
);

Cypress.Commands.add(
  'deleteCustomAWXApplicationFromDetailsView',
  (customAppName: string, customGrantType: string, customClientType: string) => {
    //Verify application details page
    cy.verifyPageTitle(customAppName);
    cy.get('[data-cy="name"]').should('contain', customAppName);
    cy.get('[data-cy="organization"]').should('contain', 'Default');
    cy.get('[data-cy="authorization-grant-type"]').should(
      'contain',
      customGrantType === 'Authorization code'
        ? 'authorization-code'
        : customGrantType.toLowerCase()
    );
    cy.get('[data-cy="client-type"]').should('contain', customClientType.toLowerCase());
    //Click on Delete application button
    cy.clickButton('Delete application');
    cy.intercept('DELETE', awxAPI`/applications/*/`).as('deleteApp');
    //Verify Delete modal
    cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
      cy.get('header').contains('Permanently delete applications');
      cy.get('button').contains('Delete application').should('have.attr', 'aria-disabled', 'true');
      cy.get('[data-cy="name-column-cell"]').should('have.text', customAppName);
      cy.get('[data-cy="organization-column-cell"]').should('have.text', 'Default');
      cy.get('input[id="confirm"]').click();
      cy.get('button').contains('Delete application').click();
    });
    //Verify API call
    cy.wait('@deleteApp').then((deleteApp) => {
      expect(deleteApp?.response?.statusCode).to.eql(204);
    });
  }
);

Cypress.Commands.add('deleteCustomAWXApplicationFromListView', (customAppName: string) => {
  cy.clickTab(/^Back to Applications$/, true);
  cy.verifyPageTitle('OAuth Applications');
  cy.clickTableRowKebabAction(customAppName, 'delete-application');
  cy.intercept('DELETE', awxAPI`/applications/*/`).as('deleteApp');
  //Verify Delete modal
  cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
    cy.get('header').contains('Permanently delete applications');
    cy.get('button').contains('Delete application').should('have.attr', 'aria-disabled', 'true');
    cy.get('[data-cy="name-column-cell"]').should('have.text', customAppName);
    cy.get('[data-cy="organization-column-cell"]').should('have.text', 'Default');
    cy.get('input[id="confirm"]').click();
    cy.get('button').contains('Delete application').click();
  });
  //Verify API call
  cy.wait('@deleteApp').then((deleteApp) => {
    expect(deleteApp?.response?.statusCode).to.eql(204);
  });
  //Confirm status
  cy.assertModalSuccess();
});

Cypress.Commands.add(
  'createAwxApplication',
  (
    authType: string,
    clientType: 'confidential' | 'public' | undefined,
    organization?: Organization
  ) => {
    return cy.requestPost<
      Application,
      Pick<
        Application,
        | 'name'
        | 'description'
        | 'organization'
        | 'client_type'
        | 'authorization_grant_type'
        | 'redirect_uris'
      >
    >(awxAPI`/applications/`, {
      name: `AAP AE OAuth Application ${randomString(2)}`,
      description: 'E2E Application Description',
      organization: organization ? organization?.id : 1,
      client_type: clientType,
      authorization_grant_type: authType,
      redirect_uris: authType === 'authorization-code' ? 'https://create_from_api.com' : '',
    });
  }
);

Cypress.Commands.add(
  'deleteAwxApplication',
  (
    // application: Application,
    id: string,
    options?: {
      /** Whether to fail on response codes other than 2xx and 3xx */
      failOnStatusCode?: boolean;
    }
  ) => {
    if (id) {
      cy.requestDelete(awxAPI`/applications/${id}/`, options);
    }
  }
);

Cypress.Commands.add('createAwxInstance', (hostname: string, listener_port?: number) => {
  if (listener_port) {
    cy.requestPost<Partial<Instance>, Instance>(awxAPI`/instances/`, {
      hostname: hostname,
      listener_port: listener_port,
      enabled: true,
      managed_by_policy: false,
      peers_from_control_nodes: false,
      node_state: 'installed',
      node_type: 'execution',
    });
  } else {
    cy.requestPost<Partial<Instance>, Instance>(awxAPI`/instances/`, {
      hostname: hostname,
      enabled: true,
      managed_by_policy: false,
      peers_from_control_nodes: false,
      node_state: 'installed',
      node_type: 'execution',
    });
  }
});

Cypress.Commands.add('removeAwxInstance', (id: string) => {
  if (id) {
    cy.requestPatch(awxAPI`/instances/${id}/`, {
      node_state: 'deprovisioning',
    });
  }
});

Cypress.Commands.add(
  'createNotificationTemplate',
  function (notificationName: string, organization: Organization) {
    cy.requestPost<
      Pick<
        NotificationTemplate,
        'name' | 'organization' | 'notification_type' | 'notification_configuration'
      >,
      NotificationTemplate
    >(awxAPI`/notification_templates/`, {
      name: notificationName ? notificationName : 'E2E Notification ' + randomString(4),
      organization: organization.id,
      notification_type: 'email',
      notification_configuration: {
        host: '127.0.0.1',
        port: 10,
        sender: 'sjdkfljdslf@jkdljfldjjfkjd.com',
        timeout: 30,
        use_ssl: false,
        use_tls: false,
        password: '',
        username: '',
        recipients: ['sdfdsfsdfsdfs'],
      },
    });
  }
);

Cypress.Commands.add(
  'deleteNotificationTemplate',
  (
    notification: NotificationTemplate,
    options?: {
      /** Whether to fail on response codes other than 2xx and 3xx */
      failOnStatusCode?: boolean;
    }
  ) => {
    cy.requestDelete(awxAPI`/notification_templates/${notification.id.toString()}/`, options);
  }
);

Cypress.Commands.add(
  'createTemplateSurvey',
  (template: JobTemplate | WorkflowJobTemplate, label: string, spec: Spec) => {
    cy.navigateTo('awx', 'templates');
    cy.verifyPageTitle('Templates');
    cy.filterTableByMultiSelect('name', [template.name]);
    cy.get('[data-cy="name-column-cell"]').within(() => {
      cy.get('a').click();
    });
    cy.verifyPageTitle(template.name);

    cy.intercept(
      'GET',
      awxAPI`/${template.type === 'job_template' ? 'job_templates' : 'workflow_job_templates'}/${template.id.toString()}/survey_spec/`
    ).as('getQuestions');

    cy.get('a[href*="survey"]').click();

    cy.wait('@getQuestions')
      .its('response.body')
      .then((survey: Survey) => {
        if (survey?.spec?.length > 0) cy.clickButton('create-question');
        else cy.clickButton('Create survey question');
      });

    cy.contains('Question');

    cy.getByDataCy('question-name').type(spec.question_name ?? '');
    cy.getByDataCy('question-description').type(spec?.question_description ?? '');
    cy.getByDataCy('question-variable').type(spec?.variable ?? '');
    spec?.required === false && cy.getByDataCy('question-required').uncheck();
    spec.type !== 'text' && cy.selectDropdownOptionByResourceName('type', label);
    if (['text', 'textarea', 'password', 'integer', 'float'].includes(spec.type)) {
      spec?.min && cy.getByDataCy('question-min').clear().type(spec.min.toString());
      spec?.max && cy.getByDataCy('question-max').clear().type(spec.max.toString());
      cy.getByDataCy('question-default').type(spec.default.toString());
    } else if (
      ['multiplechoice', 'multiselect'].includes(spec.type) &&
      Array.isArray(spec.choices)
    ) {
      spec.choices.forEach((choice) => {
        cy.getByDataCy('add-choice-input').type(`${choice}{enter}`);
      });

      const defaults = Array.isArray(spec?.default)
        ? spec.default
        : spec.default.toString().split('\n');

      const choiceBtn = spec.type === 'multiplechoice' ? 'radio' : 'checkbox';
      spec.choices.forEach((choice, index) => {
        if (defaults.includes(choice)) {
          cy.getByDataCy(`choice-${choiceBtn}-${index}`).click();
        }
      });
    }
    cy.intercept('POST', awxAPI`/${template.type}s/*/survey_spec/`).as('createSurveySpec');
    cy.clickButton('Create question');
    cy.wait('@createSurveySpec')
      .its('response.statusCode')
      .then((statusCode) => {
        expect(statusCode).to.eql(200);
        cy.get('[data-cy="name-column-cell"]').within(() => {
          cy.contains(spec.question_name);
        });
      });
  }
);

Cypress.Commands.add('toggleAndAssert', (types: string[]) => {
  cy.get('[data-cy="actions-column-cell"]').within(() => {
    cy.get('[data-cy="toggle-switch"]').click({ multiple: true });
    types.forEach((type) => {
      cy.get(`input[aria-label="Click to disable ${type}"]`).should('exist');
    });
  });
});
