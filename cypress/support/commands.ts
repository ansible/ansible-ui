/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-namespace */
/// <reference types="cypress" />
import '@cypress/code-coverage/support';
import '@4tw/cypress-drag-drop';
import { SetOptional, SetRequired } from 'type-fest';
import { AwxToken } from '../../frontend/awx/interfaces/AwxToken';
import { Credential } from '../../frontend/awx/interfaces/Credential';
import { ExecutionEnvironment } from '../../frontend/awx/interfaces/ExecutionEnvironment';
import { InstanceGroup } from '../../frontend/awx/interfaces/InstanceGroup';
import { Inventory } from '../../frontend/awx/interfaces/Inventory';
import { JobTemplate } from '../../frontend/awx/interfaces/JobTemplate';
import { Label } from '../../frontend/awx/interfaces/Label';
import { Organization } from '../../frontend/awx/interfaces/Organization';
import { Project } from '../../frontend/awx/interfaces/Project';
import { Schedule } from '../../frontend/awx/interfaces/Schedule';
import { Team } from '../../frontend/awx/interfaces/Team';
import { User } from '../../frontend/awx/interfaces/User';
import { Group, Host } from '../../frontend/awx/interfaces/generated-from-swagger/api';
import { EdaControllerToken } from '../../frontend/eda/interfaces/EdaControllerToken';
import { EdaCredential } from '../../frontend/eda/interfaces/EdaCredential';
import { EdaDecisionEnvironment } from '../../frontend/eda/interfaces/EdaDecisionEnvironment';
import { EdaProject } from '../../frontend/eda/interfaces/EdaProject';
import { EdaResult } from '../../frontend/eda/interfaces/EdaResult';
import { EdaRole } from '../../frontend/eda/interfaces/EdaRole';
import { EdaRulebook } from '../../frontend/eda/interfaces/EdaRulebook';
import {
  EdaRulebookActivation,
  EdaRulebookActivationCreate,
} from '../../frontend/eda/interfaces/EdaRulebookActivation';
import { EdaUser, EdaUserCreateUpdate } from '../../frontend/eda/interfaces/EdaUser';
import './auth';
import './awx-commands';
import './hub-commands';
import { IAwxResources } from './awx-commands';
import './common-commands';
import './eda-commands';
import './rest-commands';

declare global {
  namespace Cypress {
    interface Chainable {
      login(server: string, username: string, password: string): Chainable<void>;
      edaLogout(): Chainable<EdaUser | undefined>;
      awxLogin(): Chainable<void>;
      edaLogin(): Chainable<void>;
      hubLogin(): Chainable<void>;

      // --- NAVIGATION COMMANDS ---

      /**Navigates to a page of the UI using using the links on the page sidebar. Intended as an alternative to cy.visit(). */
      navigateTo(label: string | RegExp): Chainable<void>;

      /**Locates a title using its label. No assertion is made. */
      hasTitle(label: string | RegExp): Chainable<void>;

      // --- INPUT COMMANDS ---

      /** Get a FormGroup by it's label. A FormGroup is the PF component that wraps an input and provides a label. */
      getFormGroupByLabel(label: string | RegExp): Chainable<JQuery<HTMLElement>>;

      /** Get an input by its label. */
      getInputByLabel(label: string | RegExp): Chainable<JQuery<HTMLElement>>;

      /** Get a checkbox by its label. */
      getCheckboxByLabel(label: string | RegExp): Chainable<JQuery<HTMLElement>>;

      /** Finds an input by label and types the text into the input.*/
      typeInputByLabel(label: string | RegExp, text: string): Chainable<void>;

      /** Finds a dropdown/select component by its dropdownLabel and clicks on the option specified by dropdownOptionLabel.*/
      selectDropdownOptionByLabel(
        dropdownLabel: string | RegExp,
        dropdownOptionLabel: string,
        multiselect?: boolean
      ): Chainable<void>;

      singleSelectShouldHaveSelectedOption(
        selector: string,
        label: string | RegExp
      ): Chainable<void>;
      singleSelectShouldContainOption(selector: string, label: string | RegExp): Chainable<void>;
      selectSingleSelectOption(selector: string, label: string | RegExp): Chainable<void>;

      multiSelectShouldHaveSelectedOption(
        selector: string,
        label: string | RegExp
      ): Chainable<void>;
      multiSelectShouldNotHaveSelectedOption(
        selector: string,
        label: string | RegExp
      ): Chainable<void>;
      selectMultiSelectOption(selector: string, label: string | RegExp): Chainable<void>;

      // --- TABLE COMMANDS ---

      /** Change the current filter type in the table toolbar. */
      selectToolbarFilterType(filterLabel: string | RegExp): Chainable<void>;

      setTablePageSize(text: '10' | '20' | '50' | '100'): Chainable<void>;

      getFiltersToolbarItem(): Chainable<JQuery<HTMLElement>>;

      /**
       * Find the toolbar filter select, click it and returns the opened menu element.
       *
       * @example
       * ```
       * cy.openToolbarFilterTypeSelect().within(() => {
       *   cy.contains(/^Name$/).should('be.visible');
       * });
       * ```
       */
      openToolbarFilterTypeSelect(): Chainable<JQuery<HTMLElement>>;

      filterBySingleSelection(
        filterType: RegExp | string,
        selectLabel: RegExp | string
      ): Chainable<void>;

      filterByMultiSelection(
        filterType: RegExp | string,
        selectLabel: RegExp | string
      ): Chainable<void>;

      /** Filter the table using it's current filter by entering text. */
      filterTableByText(text: string): Chainable<void>;

      /** Filter the table using specified filter and text. */
      filterTableByTypeAndText(filterLabel: string | RegExp, text: string): Chainable<void>;

      /** Click an action in the table toolbar kebab dropdown actions menu. */
      clickToolbarKebabAction(label: string | RegExp): Chainable<void>;

      /** Get the table row containing the specified text. */
      getTableRowByText(name: string | RegExp, filter?: boolean): Chainable<void>;

      /** Select the create resource option from a toolbar create dropdown button.  ie. AWX template list toolbar **/
      clickToolbarDropdownCreateButton(
        createButtonLabel: string | RegExp,
        createButtonOption: string
      ): Chainable<void>;

      /**
       * Get the list card containing the specified text.
       * @param name
       * @param filter
       */
      getListCardByText(name: string | RegExp, filter?: boolean): Chainable<void>;

      /** Finds a table row containing text and clicks the link inside that row. */
      clickTableRow(name: string | RegExp, filter?: boolean): Chainable<void>;

      /** Finds a table row containing text and clicks action specified by label. */
      clickTableRowKebabAction(
        name: string | RegExp,
        label: string | RegExp,
        filter?: boolean
      ): Chainable<void>;

      /**
       * Finds a list card containing text and clicks action specified by label.
       * @param name
       * @param label
       * @param filter
       */
      clickListCardKebabAction(
        name: string | RegExp,
        label: string | RegExp,
        filter?: boolean
      ): Chainable<void>;

      /** Finds a table row containing text and clicks action specified by label. */
      clickTableRowPinnedAction(
        name: string | RegExp,
        label: string,
        filter?: boolean
      ): Chainable<void>;

      /** Finds a table row containing text and clicks action specified by the aria-label of the icon-only action button. */
      clickTableRowActionIcon(
        name: string | RegExp,
        ariaLabel: string,
        filter?: boolean
      ): Chainable<void>;

      /** Check if the table row containing the specified text also has the text 'Successful'. */
      tableHasRowWithSuccess(name: string | RegExp, filter?: boolean): Chainable<void>;

      /** Selects a table row by clicking on the row checkbox. */
      selectTableRow(name: string | RegExp, filter?: boolean): Chainable<void>;

      /**Expands a table row by locating the row using the provided name and thenclicking the "expand-toggle" button on that row.*/
      expandTableRow(name: string | RegExp, filter?: boolean): Chainable<void>;

      // --- MODAL COMMANDS ---

      /** Get the active modal dialog. */
      getDialog(): Chainable<void>;

      /** Opens a lookup dialaog and selects the desired row item **/
      selectRowItemInFormGroupLookupModal: (
        label: string | RegExp,
        rowItem: string
      ) => Chainable<void>;

      /** Clicks a button in the active modal dialog. */
      clickModalButton(label: string | RegExp): Chainable<void>;

      /** Clicks the confirm checkbox in the active modal dialog. */
      clickModalConfirmCheckbox(): Chainable<void>;

      /** Assert that the active modal dialog contains "Success". */
      assertModalSuccess(): Chainable<void>;

      /** Selects a table row in the active modal dialog, by clicking on the row checkbox. */
      selectTableRowInDialog(
        name: string | RegExp,
        filter?: boolean,
        inputType?: string
      ): Chainable<void>;

      // --- DETAILS COMMANDS ---
      /**Finds a button with a particular label and clicks it. */
      clickTab(label: string | RegExp, isLink?: boolean): Chainable<void>;

      /**Asserts that a specific detail term (dt) is displayed and contains text fromthe provided detail description (dd)*/
      hasDetail(detailTerm: string | RegExp, detailDescription: string | RegExp): Chainable<void>;

      clickLink(label: string | RegExp): Chainable<void>;
      clickButton(label: string | RegExp): Chainable<void>;
      clickPageAction(label: string | RegExp): Chainable<void>;

      /**Finds an alert by its label. Does not make an assertion.  */
      hasAlert(label: string | RegExp): Chainable<void>;

      /**Finds a tooltip by its label. Does not make an assertion.  */
      hasTooltip(label: string | RegExp): Chainable<void>;

      // --- REST API COMMANDS ---

      /** Sends a request to the API to create a particular resource. */
      requestPost<ResponseT, RequestT = ResponseT>(
        url: string,
        data: Partial<RequestT>
      ): Chainable<ResponseT>;

      /** Sends a request to the API to get a particular resource. */
      requestGet<T>(url: string): Chainable<T>;

      /** Sends a request to the API to delete a particular resource. */
      requestDelete(
        url: string,
        options?: {
          /** Whether to fail on response codes other than 2xx and 3xx */
          failOnStatusCode?: boolean;
        }
      ): Chainable;

      // --- AWX COMMANDS ---

      /**
       * This command is written to allow asynchronous resource creation in an AWX build using
       * a user token as the authentication method.
       * @param method
       * @param url
       * @param body
       */
      awxRequest<ResponseT = unknown>(
        method: string,
        url: string,
        body?: Cypress.RequestBody,
        /** Whether to fail on response codes other than 2xx and 3xx */
        failOnStatusCode?: boolean
      ): Chainable<Cypress.Response<ResponseT>>;

      /**
       * This command only works for creating a resource in AWX.
       * @param url
       * @param body
       */
      awxRequestPost<RequestBodyT extends Cypress.RequestBody, ResponseBodyT = RequestBodyT>(
        url: string,
        body: RequestBodyT
      ): Chainable<ResponseBodyT>;

      /**
       * This command only works for retrieving a resource in AWX.
       * @param url
       */
      awxRequestGet<ResponseBodyT = unknown>(url: string): Chainable<ResponseBodyT>;

      /**
       * This command only works for deleting a resource in AWX.
       * @param url
       */
      awxRequestDelete(
        url: string,
        options?: {
          /** Whether to fail on response codes other than 2xx and 3xx */
          failOnStatusCode?: boolean;
        }
      ): Chainable<void>;

      createAwxOrganization(): Chainable<Organization>;

      /**
       * `createAwxProject` creates an AWX Project via API,
       *  with the name `E2E Project` and appends a random string at the end of the name
       * @returns {Chainable<Project>}
       */
      createAwxProject(
        project?: SetRequired<Partial<Omit<Project, 'id'>>, 'organization'>,
        skipSync?: boolean
      ): Chainable<Project>;

      /** Create an execution environment in AWX */
      createAwxExecutionEnvironment(
        executionEnvironment: Partial<Omit<ExecutionEnvironment, 'id'>>
      ): Chainable<ExecutionEnvironment>;

      /** Creates a credential in AWX */
      createAWXCredential(
        credential: SetRequired<
          Partial<Omit<Credential, 'id'>>,
          'organization' | 'kind' | 'credential_type'
        >
      ): Chainable<Credential>;
      /**
       * Creates a project in AWX that is specific to being utilized in an EDA test.
       */
      createEdaSpecificAwxProject(options?: {
        project?: Partial<Omit<Project, 'id'>>;
      }): Chainable<Project>;

      createAwxInventory(inventory?: Partial<Omit<Inventory, 'id'>>): Chainable<Inventory>;

      /**
       * Creates an organization, project, inventory, and job template that are all linked to each other in AWX.
       * @param options
       */
      createAwxOrganizationProjectInventoryJobTemplate(options?: {
        project?: Partial<Omit<Project, 'id'>>;
        jobTemplate?: Partial<JobTemplate>;
      }): Chainable<{
        project: Project;
        inventory: Inventory;
        jobTemplate: JobTemplate;
        organization: Organization;
      }>;
      createAWXSchedule(): Chainable<Schedule>;

      createAwxJobTemplate(
        jobTemplate: SetRequired<
          Partial<Omit<JobTemplate, 'id'>>,
          'organization' | 'project' | 'inventory'
        >
      ): Chainable<JobTemplate>;

      /**
       * This command creates a job template with specific variables that will work in conjunction with
       * an EDA project and rulebook activation.
       * @param project
       * @param inventory
       * @param jobTemplate
       */
      createEdaAwxJobTemplate(
        project: Project,
        inventory: Inventory,
        jobTemplate?: Partial<JobTemplate>
      ): Chainable<JobTemplate>;
      getAwxJobTemplateByName(awxJobTemplateName: string): Chainable<JobTemplate>;
      createAwxTeam(organization: Organization): Chainable<Team>;
      createAwxUser(organization: Organization): Chainable<User>;
      createAwxInstanceGroup(
        instanceGroup?: Partial<Omit<InstanceGroup, 'id'>>
      ): Chainable<InstanceGroup>;

      createAwxLabel(label: Partial<Omit<Label, 'id'>>): Chainable<Label>;

      deleteAwxOrganization(
        organization: Organization,
        options?: {
          /** Whether to fail on response codes other than 2xx and 3xx */
          failOnStatusCode?: boolean;
        }
      ): Chainable<void>;
      deleteAwxProject(
        project: Project,
        options?: {
          /** Whether to fail on response codes other than 2xx and 3xx */
          failOnStatusCode?: boolean;
        }
      ): Chainable<void>;
      deleteAwxInventory(
        inventory: Inventory,
        options?: {
          /** Whether to fail on response codes other than 2xx and 3xx */
          failOnStatusCode?: boolean;
        }
      ): Chainable<void>;
      deleteAwxJobTemplate(
        jobTemplate: JobTemplate,
        options?: {
          /** Whether to fail on response codes other than 2xx and 3xx */
          failOnStatusCode?: boolean;
        }
      ): Chainable<void>;
      deleteAWXSchedule(
        schedule: Schedule,
        options?: {
          /** Whether to fail on response codes other than 2xx and 3xx */
          failOnStatusCode?: boolean;
        }
      ): Chainable<void>;
      deleteAwxTeam(
        team: Team,
        options?: {
          /** Whether to fail on response codes other than 2xx and 3xx */
          failOnStatusCode?: boolean;
        }
      ): Chainable<void>;
      deleteAwxUser(
        user: User,
        options?: {
          /** Whether to fail on response codes other than 2xx and 3xx */
          failOnStatusCode?: boolean;
        }
      ): Chainable<void>;
      deleteAwxInstanceGroup(
        instanceGroup: InstanceGroup,
        options?: {
          /** Whether to fail on response codes other than 2xx and 3xx */
          failOnStatusCode?: boolean;
        }
      ): Chainable<void>;
      deleteAwxLabel(
        label?: Label,
        options?: {
          /** Whether to fail on response codes other than 2xx and 3xx */
          failOnStatusCode?: boolean;
        }
      ): Chainable<void>;

      /**
       * This creates a user token in AWX that can be exported as a string and used in EDA.
       * @param awxToken
       */
      createAwxToken(awxToken?: Partial<AwxToken>): Chainable<AwxToken>;

      /**
       * This first searches AWX for an existing user token, and if one is not found, this command creates a new one.
       */
      getGlobalAwxToken(): Chainable<AwxToken>;
      deleteAwxToken(
        awxToken: AwxToken,
        options?: {
          /** Whether to fail on response codes other than 2xx and 3xx */
          failOnStatusCode?: boolean;
        }
      ): Chainable<void>;

      /**
       * Command for deleting resources created for testing
       * @param resources
       */
      deleteAwxResources(
        resources?: IAwxResources,
        options?: {
          /** Whether to fail on response codes other than 2xx and 3xx */
          failOnStatusCode?: boolean;
        }
      ): Chainable<void>;

      createInventoryHostGroup(
        organization: Organization
      ): Chainable<{ inventory: Inventory; host: Host; group: Group }>;

      // --- EDA COMMANDS ---

      /**
       * selects Eda role that is passed inside the role selection modal
       * Contributor, Auditor, Viewer, Editor, Operator, Admin
       * @param roleName
       */
      selectEdaUserRoleByName(roleName: string): Chainable<void>;

      /**
       * checks anchor links if they work as expected
       * @param anchorName
       */
      checkAnchorLinks(anchorName: string): Chainable<void>;

      clickEdaPageAction(label: string | RegExp): Chainable<void>;

      /**
       * `edaRuleBookActivationActions()` performs an action either `Relaunch` or `Restart` or `Delete rulebookActivation` on a rulebook activation,
       *
       * accepts 2 parameters action name and edaRulebookActivation name
       *
       * edaRuleBookActivationActions('Relaunch')
       * edaRuleBookActivationActions('Restart')
       * edaRuleBookActivationActions('Delete rulebookActivation')
       * @param action
       */
      edaRuleBookActivationActions(action: string, rbaName: string): Chainable<void>;

      /**
       * `edaRuleBookActivationActionsModal()` clicks on button `Relaunch` or `Restart` of a rulebook activation modal,
       *
       * accepts 2 parameters action name and edaRulebookActivation name
       *
       * edaRuleBookActivationActions('Relaunch')
       * edaRuleBookActivationActions('Restart')
       * @param action
       */
      edaRuleBookActivationActionsModal(action: string, rbaName: string): Chainable<void>;

      edaRuleBookActivationCheckbox(rbaName: string): Chainable<void>;
      /**
       * `createEdaProject()` creates an EDA Project via API,
       *  with the name `E2E Project` and appends a random string at the end of the name
       *
       * @returns {Chainable<EdaProject>}
       */
      createEdaProject(): Chainable<EdaProject>;

      /**Identify the specific Rulebooks populated by a specific project and make them available for use in testing. */
      getEdaRulebooks(edaProject: EdaProject, rulebookName?: string): Chainable<EdaRulebook[]>;

      /**Identify a particular project and make it available for use in testing. */
      getEdaRulebookActivation(
        edaRulebookActivationName: string
      ): Chainable<EdaRulebookActivation | undefined>;

      waitEdaProjectSync(edaProject: EdaProject): Chainable<EdaProject>;

      getEdaProjects(page: number, pageSize: number): Chainable<EdaResult<EdaProject>>;
      getEdaDecisionEnvironments(
        page: number,
        pageSize: number
      ): Chainable<EdaResult<EdaDecisionEnvironment>>;
      getEdaRulebookActivations(
        page: number,
        pageSize: number
      ): Chainable<EdaResult<EdaRulebookActivation>>;
      getEdaCredentials(page: number, pageSize: number): Chainable<EdaResult<EdaCredential>>;
      getEdaUsers(page: number, pageSize: number): Chainable<EdaResult<EdaUser>>;

      /**Identify a particular EDA project and make it available for use in testing. */
      getEdaProjectByName(edaProjectName: string): Chainable<EdaProject | undefined>;

      waitForRulebookActionStatus(
        edaRulebookActivation: EdaRulebookActivation
      ): Chainable<EdaRulebookActivation>;

      /**Identify a particular EDA credential and make it available for use in testing. */
      getEdaCredentialByName(edaCredentialName: string): Chainable<EdaCredential | undefined>;

      /**
       * `createEdaRulebookActivation()` creates an EDA Rulebook Activation via API,
       *  with the name `E2E Rulebook Activation` and appends a random string at the end of the name
       *
       * @returns {Chainable<EdaRulebookActivation>}
       */
      createEdaRulebookActivation(
        edaRulebookActivation: SetOptional<EdaRulebookActivationCreate, 'name'>
      ): Chainable<EdaRulebookActivation>;

      /**
       * `deleteEdaProject(projectName: Project)`
       * deletes an EDA project via API,
       * accepts the project name as parameter
       *
       * @returns {Chainable<void>}
       */
      deleteEdaProject(project: EdaProject): Chainable<void>;

      /**
       * `deleteEdaRulebookActivation(edaRulebookActivation: EdaRulebookActivation)`
       * deletes an EDA rulebook activation via API,
       * accepts the rulebook activation name as parameter
       *
       * @returns {Chainable<void>}
       */
      deleteEdaRulebookActivation(edaRulebookActivation: EdaRulebookActivation): Chainable<void>;

      /**
       * pollEdaResults - Polls eda until results are found
       * @param url The url for the get request
       *
       * @example
       *  cy.pollEdaResults<EdaProject>(`/api/eda/v1/projects/`).then(
       *    (projects: EdaProject[]) => {
       *      // Do something with projects
       *    }
       */
      pollEdaResults<T = unknown>(url: string): Chainable<T[]>;

      /**
       * Creates an EDA credential and returns the same.
       *
       * @returns {Chainable<EdaCredential>}
       */
      createEdaCredential(): Chainable<EdaCredential>;

      /**
       * Some of the Eda roles (Admin, Contributor etc) have resources
       * with more than 5 set of actions. this command helps in asserting
       * the actions by chaining of the command.
       * @param {string} resourceType
       * @returns {Chainable<JQuery<HTMLElement>>}
       */
      checkActionsofResource(resourceType: string): Chainable<JQuery<HTMLElement>>;

      /**
       * this command asserts the resource array of a particular role has the action
       * @param {string[]} resourceTypes
       * @param {string} action
       */
      checkResourceNameAndAction(resourceTypes: string[], actions: string[]): Chainable<void>;

      /**
       * getEdaRolePermissions returns the permissions of a given role id of a role
       * @param roleID get
       */
      getEdaRolePermissions(roleID: string): Chainable<EdaRole[]>;

      /**
       * Deletes an EDA credential which is provided.
       *
       * @returns {Chainable<EdaCredential>}
       */
      deleteEdaCredential(credential: EdaCredential): Chainable<void>;

      getEdaRoles(): Chainable<EdaRole[]>;
      /**
       * Creates an EDA user and returns the same.
       *
       * @returns {Chainable<EdaUser>}
       */
      createEdaUser(
        user?: SetOptional<EdaUserCreateUpdate, 'username' | 'password'>
      ): Chainable<EdaUser>;

      /**
       * Deletes an EDA user which is provided.
       *
       * @returns {Chainable<EdaUser>}
       */
      deleteEdaUser(edaUserName: EdaUser): Chainable<void>;

      /**
       * Retrieves an EDA active user which is admin.
       *
       * @returns {Chainable<EdaUser>}
       */
      getEdaActiveUser(): Chainable<EdaUser>;

      getEdaCurrentUserAwxTokens(): Chainable<EdaResult<EdaControllerToken>>;

      ensureEdaCurrentUserAwxToken(): Chainable<void>;

      addEdaCurrentUserAwxToken(awxToken: string): Chainable<EdaControllerToken>;

      deleteEdaCurrentUserAwxToken(awxToken: EdaControllerToken): Chainable<void>;

      deleteAllEdaCurrentUserTokens(): Chainable<void>;

      /**
       * Creates a DE and returns the same.
       */
      createEdaDecisionEnvironment(): Chainable<EdaDecisionEnvironment>;

      /**
       * Retrieves a DE by name.
       */
      getEdaDecisionEnvironmentByName(
        edaDEName: string
      ): Chainable<EdaDecisionEnvironment | undefined>;

      /**
       * Deletes a DE which is provided.
       */
      deleteEdaDecisionEnvironment(decisionEnvironment: EdaDecisionEnvironment): Chainable<void>;
      waitEdaDESync(edaDE: EdaDecisionEnvironment): Chainable<EdaDecisionEnvironment>;

      // -- HUB COMMANDS

      galaxykit(operation: string, ...args: string[]): Cypress.Chainable<string[]>;
      createApprovedCollection(
        namespaceName: string,
        collectionName: string,
        tags?: string[]
      ): Cypress.Chainable<void>;
      deleteNamespace(namespaceName: string): Cypress.Chainable<void>;
      deleteCollectionsInNamespace(namespaceName: string): Cypress.Chainable<void>;
    }
  }
}
