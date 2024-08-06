/// <reference types="cypress" />
import { SetOptional, SetRequired } from 'type-fest';
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
import { Role } from '../../frontend/awx/interfaces/Role';
import { Schedule } from '../../frontend/awx/interfaces/Schedule';
import { Survey, Spec as SurveySpec } from '../../frontend/awx/interfaces/Survey';
import { Team } from '../../frontend/awx/interfaces/Team';
import { AwxUser } from '../../frontend/awx/interfaces/User';
import { AwxRbacRole } from '../../frontend/awx/interfaces/AwxRbacRole';
import { WorkflowApproval } from '../../frontend/awx/interfaces/WorkflowApproval';
import { WorkflowJobTemplate } from '../../frontend/awx/interfaces/WorkflowJobTemplate';
import { WorkflowNode } from '../../frontend/awx/interfaces/WorkflowNode';
import { EdaControllerToken } from '../../frontend/eda/interfaces/EdaControllerToken';
import { EdaCredential } from '../../frontend/eda/interfaces/EdaCredential';
import { EdaCredentialType } from '../../frontend/eda/interfaces/EdaCredentialType';
import { EdaDecisionEnvironment } from '../../frontend/eda/interfaces/EdaDecisionEnvironment';
import { EdaProject } from '../../frontend/eda/interfaces/EdaProject';
import { EdaResult } from '../../frontend/eda/interfaces/EdaResult';
import { RoleDefinition } from '../../frontend/eda/interfaces/generated/eda-api';
import { EdaRulebook } from '../../frontend/eda/interfaces/EdaRulebook';
import {
  EdaRulebookActivation,
  EdaRulebookActivationCreate,
} from '../../frontend/eda/interfaces/EdaRulebookActivation';
import { EdaTeam } from '../../frontend/eda/interfaces/EdaTeam';
import { EdaUser, EdaUserCreateUpdate } from '../../frontend/eda/interfaces/EdaUser';
import { EdaRbacRole } from '../../frontend/eda/interfaces/EdaRbacRole';
import { Role as HubRole } from '../../frontend/hub/access/roles/Role';
import { RemoteRegistry } from '../../frontend/hub/administration/remote-registries/RemoteRegistry';
import { HubRemote } from '../../frontend/hub/administration/remotes/Remotes';
import { Repository } from '../../frontend/hub/administration/repositories/Repository';
import { CollectionVersionSearch } from '../../frontend/hub/collections/Collection';
import { HubItemsResponse, PulpItemsResponse } from '../../frontend/hub/common/useHubView';
import { ExecutionEnvironment as HubExecutionEnvironment } from '../../frontend/hub/execution-environments/ExecutionEnvironment';
import { HubDistribution } from '../../frontend/hub/interfaces/expanded/HubDistribution';
import { HubNamespace } from '../../frontend/hub/namespaces/HubNamespace';
import { IAwxResources } from './awx-commands';
import {
  HubCreateExecutionEnvironmentOptions,
  HubCreateNamespaceOptions,
  HubCreateRemoteOptions,
  HubCreateRemoteRegistryOptions,
  HubCreateRepositoryDistributionOptions,
  HubCreateRepositoryOptions,
  HubCreateRoleOptions,
  HubDeleteCollectionOptions,
  HubDeleteExecutionEnvironmentOptions,
  HubDeleteNamespaceOptions,
  HubDeleteRemoteOptions,
  HubDeleteRemoteRegistryOptions,
  HubDeleteRepositoryOptions,
  HubDeleteRequestOptions,
  HubDeleteRoleOptions,
  HubGetRequestOptions,
  HubPatchRequestOptions,
  HubPostRequestOptions,
  HubPutRequestOptions,
  HubQueryExecutionEnvironmentsOptions,
  HubQueryNamespacesOptions,
  HubQueryRemotesOptions,
  HubQueryRepositoriesOptions,
  HubQueryRolesOptions,
  HubRequestOptions,
} from './hub-commands';
import { HubUser } from '../../frontend/hub/interfaces/expanded/HubUser';
import { HubTeam } from '../../frontend/hub/interfaces/expanded/HubTeam';

declare global {
  namespace Cypress {
    interface Chainable {
      // ==============================================================================================================
      // Login Commands
      // ==============================================================================================================

      /** Login to the application. This will call the correct login for the application i.e. cy.awxLogin() */
      login(): Chainable<void>;

      /** Logout of the application. This will call the correct logout for the application i.e. cy.awxLogout() */
      logout(): Chainable<void>;

      /** @deprecated use cy.login */
      awxLogin(): Chainable<void>;

      /** @deprecated use cy.logout */
      awxLogout(): Chainable<void>;

      /** Login to the AWX with a user created during the test*/
      awxLoginTestUser(username: string, password: string): Chainable<void>;

      /** @deprecated use cy.login */
      edaLogin(username?: string, password?: string): Chainable<void>;

      /** @deprecated use cy.logout */
      edaLogout(): Chainable<void>;

      /** @deprecated use cy.login */
      hubLogin(): Chainable<void>;

      /** @deprecated use cy.logout */
      hubLogout(): Chainable<void>;

      /** Check that the required environment variables are set */
      requiredVariablesAreSet(requiredVariables: string[]): Chainable<void>;

      // ==============================================================================================================
      // Navigation Commands
      // ==============================================================================================================

      /**
       * Navigates to a page of the UI using using the links on the page sidebar.
       * Intended as an alternative to cy.visit().
       */
      navigateTo(component: 'platform' | 'awx' | 'eda' | 'hub', label: string): Chainable<void>;

      /** Locates a title using its label. No assertion is made. */
      verifyPageTitle(label: string): Chainable<void>;

      // ==============================================================================================================
      // Core Commands
      // ==============================================================================================================

      /** Get by selector, making sure it is not disabled or hidden */
      getBy(selector: string): Chainable<JQuery<HTMLElement>>;

      /** Get by data-cy attribute, making sure it is not disabled or hidden */
      getByDataCy(dataCy: string): Chainable<JQuery<HTMLElement>>;

      /** Contains by selector, making sure it is not disabled or hidden */
      containsBy(selector: string, text: string | number | RegExp): Chainable<JQuery<HTMLElement>>;

      /** Contains by data-cy attribute, making sure it is not disabled or hidden */
      containsByDataCy(
        dataCy: string,
        text: string | number | RegExp
      ): Chainable<JQuery<HTMLElement>>;

      poll<ResponseT>(
        fn: () => Chainable<ResponseT | undefined>,
        check: (response: ResponseT) => boolean,
        calledTimes?: number
      ): Chainable<ResponseT>;

      // ==============================================================================================================
      // Input Commands
      // ==============================================================================================================

      /**
       * Select a value from a single select input by selector, making sure it is not disabled or hidden.
       *
       * - Opens the dropdown
       * - Loads all items if it is an async select
       * - Searches for the value
       * - Selects the value
       * - Closes the dropdown
       *
       * @example Select inventory
       * ```
       * cy.singleSelectBy('#inventory-select', 'inventory1');
       * ```
       *
       * @param selector - The selector of the single select input
       * @param value - The value to select
       */
      singleSelectBy(
        selector: string,
        value: string,
        exactMatch?: boolean,
        notFound?: boolean
      ): Chainable<void>;

      /**
       * Select a value from a single select input by data-cy attribute, making sure it is not disabled or hidden.
       *
       * - Opens the dropdown
       * - Loads all items if it is an async select
       * - Searches for the value
       * - Selects the value
       * - Closes the dropdown
       *
       * @example Select inventory
       * ```
       * cy.singleSelectByDataCy('inventory-select', 'inventory1');
       * ```
       *
       * @param dataCy - The data-cy attribute of the single select input
       * @param value - The value to select
       */
      singleSelectByDataCy(
        dataCy: string,
        value: string,
        exactMatch?: boolean,
        notFound?: boolean
      ): Chainable<void>;

      /**
       * Select a value from a multi select input by selector, making sure it is not disabled or hidden.
       *
       * - Opens the dropdown
       * - Loads all items if it is an async select
       * - Searches for the value
       * - Selects the values
       * - Closes the dropdown
       *
       * @example Adding uses to a team
       * ```
       * cy.multiSelectByDataCy('#user-select', ['user1', 'user2']);
       * ```
       *
       * @param selector - The selector of the multi select input
       * @param values - The values to select
       */
      multiSelectBy(selector: string, values: string[]): Chainable<void>;

      /**
       * Select a value from a multi select input by data-cy attribute, making sure it is not disabled or hidden.
       *
       * - Opens the dropdown
       * - Loads all items if it is an async select
       * - Searches for the value
       * - Selects the values
       * - Closes the dropdown
       *
       * @example Adding uses to a team
       * ```
       * cy.multiSelectByDataCy('user-select', ['user1', 'user2']);
       * ```
       *
       * @param dataCy - The data-cy attribute of the multi select input
       * @param values - The values to select
       */
      multiSelectByDataCy(dataCy: string, values: string[]): Chainable<void>;

      /** Used internally to load all items in the singleSelectBy and multiSelectBy commands */
      selectLoadAll(): Chainable<void>;

      clickLink(label: string | RegExp): Chainable<void>;

      clickButton(label: string | RegExp): Chainable<void>;

      /** Finds a tooltip by its label. Does not make an assertion. */
      hasTooltip(label: string | RegExp): Chainable<void>;

      dataEditorSetFormat(configType: string): Chainable<void>;
      dataEditorShouldContain(selector: string, value: string | object): Chainable<void>;
      dataEditorType(selector: string, value: string, clear?: boolean): Chainable<void>;
      dataEditorTypeByDataCy(dataCy: string, value: string, clear?: boolean): Chainable<void>;

      /** @deprecated use cy.dataEditorShouldContain */
      assertMonacoTextField(textString: string): Chainable<void>;

      /** This command works for a form field to look up item from table
       * (used for components that do not utilize the PageFormAsyncSelect component yet) */
      selectItemFromLookupModal(resource: string, itemName: string): Chainable<void>;

      /**
       * This command works for a form field that can show up either as a drop down
       * or as a spyglass lookup.
       *
       * @param {String} resource: The name of a resource entered as a string. IE: credentials, execution-environments, etc.
       * @param {String} itemName: The specific name of that resource entered as a string. Set as a third param
       * */
      selectDropdownOptionByResourceName(resource: string, itemName: string): Chainable<void>;

      singleSelectShouldHaveSelectedOption(
        selector: string,
        label: string | RegExp
      ): Chainable<void>;
      singleSelectShouldContainOption(selector: string, label: string | RegExp): Chainable<void>;
      selectSingleSelectOption(selector: string, label: string | RegExp): Chainable<void>;

      // TODO REMOVE only needed in one test
      multiSelectShouldHaveSelectedOption(
        selector: string,
        label: string | RegExp
      ): Chainable<void>;

      // TODO REMOVE only needed in one test
      multiSelectShouldNotHaveSelectedOption(
        selector: string,
        label: string | RegExp
      ): Chainable<void>;

      selectMultiSelectOption(selector: string, label: string | RegExp): Chainable<void>;

      searchAndDisplayResource(resourceName: string): Chainable<void>;

      // ==============================================================================================================
      // Table Commands
      // ==============================================================================================================

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

      /** @deprecated use cy.contains('th', 'text').click() */
      clickTableHeader(name: string | RegExp): Chainable<void>;

      setTableView(
        view: 'table' | 'list' | 'card',
        options?: { ignoreNotFound?: boolean }
      ): Chainable<void>;

      setTablePageSize(text: string): Chainable<void>;

      /** Select the active table toolbar filter by data-cy */
      selectTableFilter(dataCy: string): Chainable<void>;

      /**
       * Select the active table toolbar filter by label
       * @deprecated prefer cy.selectTableFilter instead which uses data-cy
       */
      selectToolbarFilterByLabel(label: string | RegExp): Chainable<void>;

      /**
       * Filters the table by using a filter that has a text input.
       * This is used when the filter is a text input.
       * @example
       * ```
       * cy.filterTableByText('name', organization.name);
       * cy.filterTableByText('description', organization.description);
       * ```
       */
      filterTableByTextFilter(
        filterDataCy: string,
        text: string,
        options?: { disableFilterSelection?: boolean }
      ): Chainable<void>;

      /** @deprecated use cy.filterTableByTextFilter instead */
      filterTableByText(text: string, variant?: 'SingleText' | 'MultiText'): Chainable<void>;

      /**
       * Filters the table by using a filter that has a single select input.
       * This is used when the filter is a single select dropdown.
       * @example
       * ```
       * cy.filterTableBySingleSelect('status', "Success");
       * cy.filterTableBySingleSelect('status', "Pending");
       * ```
       */
      filterTableBySingleSelect(
        filterDataCy: string,
        optionLabel: string,
        notFound?: boolean
      ): Chainable<void>;

      /**
       * Filters the table by using a filter that has a multi select input.
       * This is used when the filter is a multi select dropdown.
       * @example
       * ```
       * cy.filterTableByMultiSelect('status', ["Success", "Pending"]);
       * ```
       */
      filterTableByMultiSelect(filterDataCy: string, optionLabels: string[]): Chainable<void>;

      /**
       * Gets a table row containing the specified text for the specified column.
       *
       * @example
       * ```
       * cy.getTableRow('name', organization.name).within(() => {});
       * cy.getTableRow('id', organization.id).within(() => {});
       * ```
       *
       * @param columnDataCy - The data-cy attribute of the column to filter by.
       * @param text - The text to search for in the column.
       * @param options.disableFilter - This should not be used in general.
       *
       * @note Filtering will use the filter that has the same data-cy as the columnDataCy.
       */
      getTableRow(
        columnDataCy: string,
        text: string,
        options?: { disableFilter?: boolean; disableFilterSelection?: boolean }
      ): Chainable<JQuery<HTMLTableRowElement>>;

      /**
       * Gets a table cell containing the specified text for the specified column.
       *
       * @example
       * ```
       * cy.getTableCell('name', organization.name).within(() => {
       *  cy.get('a').click();
       * });
       * ```
       *
       * @param cellDataCy - The data-cy attribute of the column to filter by.
       * @param text - The text to search for in the column.
       * @param options.disableFilter - This should not be used in general.
       *
       * @note Filtering will use the filter that has the same data-cy as the columnDataCy.
       */
      getTableCell(
        cellDataCy: string,
        text: string,
        options?: { disableFilter?: boolean }
      ): Chainable<JQuery<HTMLTableRowElement>>;

      /**
       * Click the link in the table row that contains the specified text for the specified column.
       * Often used to navigate to a detail page.
       *
       * @example
       * ```
       * cy.clickTableRowLink('name', organization.name)
       * ```
       *
       * @param columnDataCy - The data-cy attribute of the column to filter by.
       * @param text - The text to search for in the column.
       * @param options.disableFilter - This should not be used in general.
       *
       * @note Filtering will use the filter that has the same data-cy as the columnDataCy.
       */
      clickTableRowLink(columnDataCy: string, text: string, options?: { disableFilter?: boolean });

      /**
       * Click and action in a kebab dropdown
       *
       * @example
       * ```
       * cy.clickKebabAction('kebab-dropdown', 'edit')
       * ```
       *
       * @param kebabDataCy - The data-cy attribute of the kebab dropdown.
       * @param actionDataCy - The data-cy attribute of the action to click.
       */
      clickKebabAction(kebabDataCy: string, actionDataCy: string): Chainable<void>;

      /**
       * Click the action in the table row that contains the specified text for the specified column.
       *
       * @example
       * ```
       * cy.clickTableRowAction('name', organization.name, 'edit')
       * cy.clickTableRowAction('name', organization.name, 'delete', { inKebab: true })
       * ```
       *
       * @param columnDataCy - The data-cy attribute of the column to filter by.
       * @param text - The text to search for in the column.
       * @param actionDataCy - The data-cy attribute of the action to click.
       * @param options.inKebab - Indicates that the action is in a kebab dropdown.
       * @param options.disableFilter - This should not be used in general.
       *
       * @note Filtering will use the filter that has the same data-cy as the columnDataCy.
       */
      clickTableRowAction(
        columnDataCy: string,
        text: string,
        actionDataCy: string,
        options?: { inKebab?: boolean; disableFilter?: boolean }
      );

      /** Selects a table row by clicking on the row checkbox. */
      selectTableRowByCheckbox(
        columnDataCy: string,
        text: string,
        options?: { disableFilter?: boolean; disableFilterSelection?: boolean }
      ): Chainable<void>;

      /** @deprecated use cy.getTableRow instead */
      clickTableRow(name: string | RegExp, filter?: boolean): Chainable<void>;

      /** @deprecated use cy.getTableRow instead */
      getTableRowByText(
        name: string | RegExp,
        filter?: boolean,
        variant?: 'MultiText' | 'SingleText'
      ): Chainable<void>;

      /** @deprecated use cy.filterTableBySelect instead */
      filterBySingleSelection(
        filterType: RegExp | string,
        selectLabel: RegExp | string
      ): Chainable<void>;

      /** @deprecated use cy.filterTableBySelect instead */
      filterByMultiSelection(
        filterType: RegExp | string,
        selectLabel: RegExp | string
      ): Chainable<void>;

      /** @deprecated use cy.filterTableBySelect instead */
      filterTableBySingleText(text: string, disableWait?: boolean): Chainable<void>;

      /** @deprecated use cy.filterTableByText instead */
      filterTableByTypeAndText(filterLabel: string | RegExp, text: string): Chainable<void>;

      /** @deprecated use cy.filterTableByText instead */
      filterTableByTypeAndSingleText(
        filterLabel: string | RegExp,
        text: string,
        variant?: 'MultiText' | 'SingleText'
      ): Chainable<void>;

      clearAllFilters(): Chainable<void>;

      /** Click an action in the table toolbar kebab dropdown actions menu. */
      clickToolbarKebabAction(dataCy: string): Chainable<void>;

      /** Get the table row containing the specified text with 'ToolbarFilterType.SingleText' filter. */
      getTableRowBySingleText(name: string | RegExp, filter?: boolean): Chainable<void>;

      /** Get the list row containing the specified text. */
      getListRowByText(name: string | RegExp, filter?: boolean): Chainable<void>;

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
        dataCyLabel: string,
        filter?: boolean
      ): Chainable<void>;

      /**
       * Finds a list card containing text and clicks action specified by label.
       * @param id
       * @param dataCyLabel
       */
      clickListCardKebabAction(id: number, dataCyLabel: string): Chainable<void>;

      /** Finds a table row containing text and clicks action specified by label. */
      clickTableRowPinnedAction(
        name: string | RegExp,
        iconDataCy: string,
        filter?: boolean
      ): Chainable<void>;

      /** Selects a table row by clicking on the row checkbox. */
      selectTableRow(name: string | RegExp, filter?: boolean): Chainable<void>;

      /**Expands a table row by locating the row using the provided name and thenclicking the "expand-toggle" button on that row.*/
      expandTableRow(name: string | RegExp, filter?: boolean): Chainable<void>;

      /** Selects a table row in the active modal dialog, by clicking on the row checkbox. */
      selectTableRowInDialog(name: string | RegExp, filter?: boolean): Chainable<void>;

      // ==============================================================================================================
      // Details Commands
      // ==============================================================================================================

      selectDetailsPageKebabAction(dataCy: string): Chainable<void>;

      /**Finds a button with a particular label and clicks it. */
      clickTab(label: string | RegExp, isLink?: boolean): Chainable<void>;

      /**Asserts that a specific detail term (dt) is displayed and contains text fromthe provided detail description (dd)*/
      hasDetail(detailTerm: string | RegExp, detailDescription: string | RegExp): Chainable<void>;

      clickPageAction(dataCy: string): Chainable<void>;

      // ==============================================================================================================
      // Modal Commands
      // ==============================================================================================================

      getModal(): Chainable<JQuery<HTMLElement>>;

      /**
       * This command is used to get the wizard component and do associated actions.
       */
      getWizard(): Chainable<JQuery<HTMLElement>>;

      /**
       * This command is used to verify the details on the review step of a wizard component.
       */
      verifyReviewStepWizardDetails(
        section: string,
        itemsList: string[],
        itemCount: string
      ): Chainable<void>;

      /** Clicks a button in the active modal dialog. */
      clickModalButton(label: string | RegExp): Chainable<void>;

      /** Clicks the confirm checkbox in the active modal dialog. */
      clickModalConfirmCheckbox(): Chainable<void>;

      /** Assert that the active modal dialog contains "Success". */
      assertModalSuccess(): Chainable<void>;

      // ==============================================================================================================
      // Alert Commands
      // ==============================================================================================================

      /** Finds an alert by its label. Does not make an assertion. */
      hasAlert(label: string | RegExp): Chainable<void>;

      // ==============================================================================================================
      // REST API Commands
      // ==============================================================================================================

      requestGet<T>(url: string): Chainable<T>;

      requestPost<ResponseT, RequestT = ResponseT>(
        url: string,
        data: Partial<RequestT>,
        failOnStatusCode?: boolean
      ): Chainable<ResponseT>;

      requestPut<ResponseT, RequestT = ResponseT>(
        url: string,
        data: Partial<RequestT>
      ): Chainable<ResponseT>;

      requestPatch<ResponseT, RequestT = ResponseT>(
        url: string,
        data: Partial<RequestT>
      ): Chainable<ResponseT>;

      requestDelete(
        url: string,
        options?: {
          /** Whether to fail on response codes other than 2xx and 3xx */
          failOnStatusCode?: boolean;
        }
      ): Chainable;

      /** Polls a GET request to the API until the check function returns a result. */
      requestPoll<ResponseT, ResultT = ResponseT>(options: {
        url: string;
        check: (response: Cypress.Response<ResponseT>) => ResultT | undefined;
        interval?: number;
      }): Chainable<ResponseT>;

      // ==============================================================================================================
      // AWX Commands
      // ==============================================================================================================

      createAwxOrganization(awxOrganization?: Partial<Organization>): Chainable<Organization>;
      editAwxApplication(application: Application, name: string): Chainable<Application>;

      /**
       * `createAwxProject` creates an AWX Project via API,
       *  with the name `E2E Project` and appends a random string at the end of the name
       * @returns {Chainable<Project>}
       */
      createAwxProject(
        organization: Organization,
        project?: Partial<Project>,
        scm_url?: string,
        skipSync?: boolean
      ): Chainable<Project>;

      waitForProjectToFinishSyncing(projectId: number): Chainable<Project>;

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
      /** Creates a credential type in AWX */
      createAwxCredentialType(): Chainable<CredentialType>;

      createAwxInventory(
        organization: Organization,
        inventory?: Partial<Inventory>
      ): Chainable<Inventory>;

      createAwxConstructedInventory(
        organization: Organization,
        params?: { source_vars?: boolean; input_inventory_count?: number }
      ): Chainable<Inventory>;

      createAwxInventorySource(
        inventory: Partial<Pick<Inventory, 'id'>>,
        project: Partial<Pick<Project, 'id'>>
      ): Chainable<InventorySource>;

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
      createAWXSchedule(schedule?: Partial<Schedule>): Chainable<Schedule>;

      createAwxJobTemplate(
        jobTemplate: SetRequired<
          Partial<Omit<JobTemplate, 'id'>>,
          'organization' | 'project' | 'inventory'
        >,
        playbook?: string,
        instanceGroup?: InstanceGroup
      ): Chainable<JobTemplate>;

      createTemplateSurvey(
        template: JobTemplate | WorkflowJobTemplate,
        label: string,
        survey: SurveySpec
      ): Chainable<void>;

      /**
       * `createAwxApplication` creates an AWX Application via API,
       *  with the name `E2E Application` and appends a random string at the end of the name
       * @returns {Chainable<Application>}
       */
      createAwxApplication(
        authType: string,
        clientType: 'confidential' | 'public' | undefined,
        organization?: Organization
      ): Chainable<Application>;

      createAwxWorkflowJobTemplate(
        workflowJobTemplate: Partial<WorkflowJobTemplate>
      ): Chainable<WorkflowJobTemplate>;
      /**
       * This command creates a job template with specific variables that will work in conjunction with
       * an EDA project and rulebook activation.
       * @param project
       * @param inventory
       * @param jobTemplate
       */

      createAwxSurvey(
        surveySpec: Partial<Survey>,
        template: Partial<JobTemplate | WorkflowJobTemplate>
      ): Chainable<Survey>;

      getAwxWorkflowJobTemplateByName(
        awxWorkflowJobTemplateName: string
      ): Chainable<WorkflowJobTemplate>;

      getAwxInstanceGroupByName(instanceGroupName: string): Chainable<InstanceGroup>;

      getAwxOrgByAnsibleId(orgAnsibleId: string | undefined): Chainable<Organization>;

      getGatewayOrgByAnsibleId(orgAnsibleId: string | undefined): Chainable<Organization>;

      getAwxUserByAnsibleId(userAnsibleId: string | undefined): Chainable<AwxUser>;

      getAwxTeamByAnsibleId(teamAnsibleId: string | undefined): Chainable<Team>;

      /**
       * pollAWXResults - Polls AWX until results are found
       * @param url The url for the get request
       *
       * @example
       *  cy.pollAWXResults<Project>(awxAPI`/projects/`).then(
       *    (projects: Project[]) => {
       *      // Do something with projects
       *    }
       */
      pollAWXResults<T = unknown>(url: string): Chainable<T[]>;

      renderWorkflowVisualizerNodesFromFixtureFile(
        workflowJobTemplateName: string,
        fixtureFile: string
      ): Chainable<void>;

      createEdaAwxJobTemplate(
        project: Project,
        inventory: Inventory,
        jobTemplate?: Partial<JobTemplate>
      ): Chainable<JobTemplate>;

      /**
       * This command sends a request to the API to assign a certain type of role access to a user
       * for a workflow job template.
       * @param wfjtName: pass the existing workflow job template name as a string
       * @param userId: pass the ID of the existing user as a number
       * @param roleName: pass the name of the role type that you want to assign to your user.
       * Available roles for a workflow job template are: Admin, Execute, Read, Approve
       */
      giveUserWfjtAccess(wfjtName: string, userId: number, roleName: string): Chainable<Role>;

      /**
       * This command sends a request to the API to assign a certain type of role access to a user
       * for a credential.
       * @param credentialName: pass the existing credential name as a string
       * @param userId: pass the ID of the existing user as a number
       * @param roleName: pass the name of the role type that you want to assign to your user.
       * Available roles for a credential are: Admin, Use, Read
       */
      giveUserCredentialsAccess(
        credentialName: string,
        userId: number,
        roleName: string
      ): Chainable<Role>;

      /**
       * This command sends a request to the API to assign a certain type of role access to a user
       * for a project.
       * @param projectName: pass the existing project name as a string
       * @param userId: pass the ID of the existing user as a number
       * @param roleName: pass the name of the role type that you want to assign to your user.
       * Available roles for a project are: Admin, Use, Update, Read
       */
      giveUserProjectAccess(projectName: string, userId: number, roleName: string): Chainable<Role>;

      /**
       * This command sends a request to the API to assign a certain type of role access to a user
       * for an inventory.
       * @param inventoryName: pass the existing inventory name as a string
       * @param userId: pass the ID of the existing user as a number
       * @param roleName: pass the name of the role type that you want to assign to your user.
       * Available roles for a inventory are: Admin, Adhoc, Use, Update, Read
       */
      giveUserInventoryAccess(
        inventoryName: string,
        userId: number,
        roleName: string
      ): Chainable<Role>;

      /**
       * This command sends a request to the API to assign a certain type of role access to a user
       * for an organization.
       * @param organizationName: pass the existing organization name as a string
       * @param userId: pass the ID of the existing user as a number
       * @param roleName: pass the name of the role type that you want to assign to your user.
       * Available roles for a organization are: Admin, Execute, Project Admin, Inventory Admin,
       *  Credential Admin, Workflow Admin, Notification Admin, Job Template Admin, Execution Environment Admin,
       *  Auditor, Member, Read, Approve
       */
      giveUserOrganizationAccess(
        organizationName: string,
        userId: number,
        roleName: string
      ): Chainable<Role>;

      /**
       * This command sends a request to the API to assign a certain type of role access to a user
       * for a team.
       * @param teamName: pass the existing team name as a string
       * @param userId: pass the ID of the existing user as a number
       * @param roleName: pass the name of the role type that you want to assign to your user.
       * Available roles for a team are: Admin, Member, Read
       */
      giveUserTeamAccess(teamName: string, userId: number, roleName: string): Chainable<Role>;

      getAwxJobTemplateByName(awxJobTemplateName: string): Chainable<JobTemplate>;

      /**
       * @Example
       * ```tsx
       * cy.createAwxUser({ organization: organization.id, is_superuser:true });
       * ```
       */
      createAwxTeam(awxTeam?: Partial<Team>): Chainable<Team>;
      createAwxUser(awxUser?: Partial<AwxUser>): Chainable<AwxUser>;
      getCurrentUser(): Chainable<AwxUser>;
      getAwxRoles(queryParams?: {
        content_type__model?: string;
        managed?: boolean;
      }): Chainable<AwxItemsResponse<AwxRbacRole>>;
      getAwxRoleDetail(roleID: string): Chainable<AwxRbacRole>;

      /**
       * Creates an object to AWX role definition.
       *
       * @returns {Chainable<AwxRbacRole>}
       */
      createAwxRole(
        roleName: string,
        description: string,
        content_type,
        permissions: string[]
      ): Chainable<AwxRbacRole>;

      deleteAwxRole(awxRoleDefinition: AwxRbacRole): Chainable<void>;
      createAwxInstanceGroup(
        instanceGroup?: Partial<Omit<InstanceGroup, 'id'>>
      ): Chainable<InstanceGroup>;
      createAwxInstance(hostname: string, listener_port?: number): Chainable<Instance>;
      createAwxLabel(label: Partial<Omit<Label, 'id'>>): Chainable<Label>;
      createGlobalOrganization(): Chainable<void>;
      createGlobalProject(): Chainable<void>;

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
      deleteAwxCredential(
        credential: Credential,
        options?: {
          /** Whether to fail on response codes other than 2xx and 3xx */
          failOnStatusCode?: boolean;
        }
      ): Chainable<void>;
      deleteAwxCredentialType(
        credentialType: CredentialType,
        options?: {
          /** Whether to fail on response codes other than 2xx and 3xx */
          failOnStatusCode?: boolean;
        }
      ): Chainable<void>;
      deleteAwxApplication(
        id: string,
        options?: {
          /** Whether to fail on response codes other than 2xx and 3xx */
          failOnStatusCode?: boolean;
        }
      ): Chainable<void>;

      deleteAwxExecutionEnvironment(
        execution_environment: ExecutionEnvironment,
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

      deleteAwxConstructedInventory(constructedInv: Inventory): Chainable<void>;

      deleteAwxInventorySource(
        inventorySource: InventorySource,
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
      deleteAwxJob(
        job: Job,
        options?: {
          /** Whether to fail on response codes other than 2xx and 3xx */
          failOnStatusCode?: boolean;
        }
      ): Chainable<void>;

      deleteAwxWorkflowJobTemplate(
        workflowJobTemplate: WorkflowJobTemplate,
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
        user: AwxUser,
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
      removeAwxInstance(
        id: string,
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

      createInventoryHost(
        organization: Organization,
        kind: '' | 'constructed' | 'smart'
      ): Chainable<{ inventory: Inventory; host: AwxHost }>;

      createInventoryHostGroup(
        organization: Organization
      ): Chainable<{ inventory: Inventory; host: AwxHost; group: InventoryGroup }>;

      createInventoryGroup(inventory: Inventory, groupName: string): Chainable<InventoryGroup>;

      createAwxWorkflowVisualizerJobTemplateNode(
        workflowJT: WorkflowJobTemplate,
        jobTemplateNode: JobTemplate
      ): Chainable<WorkflowNode>;

      createAwxWorkflowVisualizerProjectNode(
        workflowJobTemplate: WorkflowJobTemplate,
        project: Project
      ): Chainable<WorkflowNode>;

      createAwxWorkflowVisualizerApprovalNode(
        firstNode: WorkflowJobTemplate
      ): Chainable<WorkflowNode>;

      createAwxWorkflowVisualizerInventorySourceNode(
        workflowJT: WorkflowJobTemplate,
        inventorySourceId: InventorySource
      ): Chainable<WorkflowNode>;

      createAwxWorkflowVisualizerWJTNode(workflowJT: WorkflowJobTemplate): Chainable<WorkflowNode>;

      createAwxWorkflowVisualizerManagementNode(
        workflowJobTemplate: WorkflowJobTemplate,
        managementId: 1 | 2 | 3 | 4
      ): Chainable<WorkflowNode>;

      createWorkflowJTSuccessNodeLink(
        firstNode: WorkflowNode,
        secondNode: WorkflowNode
      ): Chainable<WorkflowNode>;

      createWorkflowJTFailureNodeLink(
        firstNode: WorkflowNode,
        secondNode: WorkflowNode
      ): Chainable<WorkflowNode>;

      createWorkflowJTAlwaysNodeLink(
        firstNode: WorkflowNode,
        secondNode: WorkflowNode
      ): Chainable<WorkflowNode>;

      getFirstPendingWorkflowApprovalsForWorkflowJobID(
        workflowJobID: number
      ): Chainable<WorkflowApproval | undefined>;
      pollFirstPendingWorkflowApprovalsForWorkflowJobID(
        workflowJobID: number
      ): Chainable<WorkflowApproval>;

      waitForTemplateStatus(jobID: string): Chainable<AwxItemsResponse<JobEvent>>;
      waitForManagementJobToProcess(jobID: string, retries?: number): Chainable<Job>;
      waitForJobToProcessEvents(
        jobID: string,
        type: 'jobs' | 'inventory_updates',
        retries?: number
      ): Chainable<Job>;
      waitForWorkflowJobStatus(jobID: string): Chainable<Job>;
      cancelJob(job: Job): Chainable<Job>;

      createAndDeleteCustomAWXCredentialTypeUI(
        customCredentialTypeName: string,
        inputConfig?: string,
        injectorConfig?: string,
        defaultConfig?: string
      ): Chainable<void>;

      createCustomAWXApplicationFromUI(
        customAppName: string,
        customAppDescription: string,
        customGrantType: string,
        customClientType: string,
        customRedirectURIS: string
      ): Chainable<void>;

      editCustomAWXApplicationFromDetailsView(
        customAppName: string,
        customGrantType: string,
        customClientType: string,
        newCustomClientType: string
      ): Chainable<void>;

      editCustomAWXApplicationFromListView(
        customAppName: string,
        customGrantType: string,
        newCustomClientType: string
      ): Chainable<void>;

      deleteCustomAWXApplicationFromDetailsView(
        customAppName: string,
        customGrantType: string,
        customClientType: string
      ): Chainable<void>;

      deleteCustomAWXApplicationFromListView(customAppName: string): Chainable<void>;

      editNodeInVisualizer(
        nodeName: string,
        newNodeType: string,
        newNodeName?: string
      ): Chainable<void>;

      removeAllNodesFromVisualizerToolbar(): Chainable<void>;
      actionsWFApprovalConfirmModal(
        action: 'approve' | 'deny' | 'cancel' | 'delete'
      ): Chainable<void>;
      removeNodeInVisualizer(nodeName: string): Chainable<void>;

      inputCustomCredTypeConfig(configType: string, config: string): Chainable<void>;

      /**
       * This command will toggle single or multiple switches and assert its
       * state after toggling.
       *
       * @param {string[]} types
       * @returns {Chainable<void>}
       */
      toggleAndAssert(types: string[]): Chainable<void>;

      selectPromptOnLaunch(resourceName: string): Chainable<void>;

      createNotificationTemplate(
        notificationName: string,
        organization: Organization
      ): Chainable<NotificationTemplate>;

      deleteNotificationTemplate(
        notification: NotificationTemplate,
        options?: {
          /** Whether to fail on response codes other than 2xx and 3xx */
          failOnStatusCode?: boolean;
        }
      ): Chainable<void>;

      addEERolesToUsersInOrganization(organizationName: string): Chainable<void>;
      addEERolesToTeamsInOrganization(organizationName: string): Chainable<void>;

      // ==============================================================================================================
      // EDA Commands
      // ==============================================================================================================

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

      /**
       * `edaRuleBookActivationActionsModal()` clicks on button `Relaunch` or `Restart` of a rulebook activation modal,
       *
       * accepts 2 parameters action name and edaRulebookActivation name
       *
       * edaRuleBookActivationActionsModal('Relaunch')
       * edaRuleBookActivationActionsModal('Restart')
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
      getEdaCredentialTypes(
        page: number,
        pageSize: number
      ): Chainable<EdaResult<EdaCredentialType>>;
      getEdaUsers(page: number, pageSize: number): Chainable<EdaResult<EdaUser>>;
      getEdaUser(id: number): Chainable<EdaUser>;

      /**Identify a particular EDA project and make it available for use in testing. */
      getEdaProjectByName(edaProjectName: string): Chainable<EdaProject>;

      waitForRulebookActionStatus(
        edaRulebookActivation: EdaRulebookActivation
      ): Chainable<EdaRulebookActivation>;

      /**Identify a particular EDA credential and make it available for use in testing. */
      getEdaCredentialByName(edaCredentialName: string): Chainable<EdaCredential | undefined>;

      /**Identify a particular EDA credential type and make it available for use in testing. */
      getEdaCredentialTypeByName(
        edaCredentialTypeName: string
      ): Chainable<EdaCredentialType | undefined>;

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
      deleteEdaProject(
        project: EdaProject,
        options?: {
          /** Whether to fail on response codes other than 2xx and 3xx */
          failOnStatusCode?: boolean;
        }
      ): Chainable<void>;

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
       *  cy.pollEdaResults<EdaProject>(edaAPI`/projects/`).then(
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
       * getEdaRoleDetail returns the detail of a given role id of a role
       * @param roleID get
       */
      getEdaRoleDetail(roleID: string): Chainable<EdaRbacRole>;

      /**
       * Deletes an EDA credential which is provided.
       *
       * @returns {Chainable<EdaCredential>}
       */
      deleteEdaCredential(credential: EdaCredential): Chainable<void>;

      /**
       * Creates an EDA credential and returns the same.
       *
       * @returns {Chainable<EdaCredentialType>}
       */
      createEdaCredentialType(): Chainable<EdaCredentialType>;

      /**
       * Deletes an EDA credential type which is provided.
       *
       * @returns {Chainable<EdaCredentialType>}
       */
      deleteEdaCredentialType(delete_cred_type: EdaCredentialType): Chainable<void>;

      getEdaRoles(queryParams?: {
        content_type__model?: string;
        managed?: boolean;
      }): Chainable<EdaRbacRole[]>;
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
       * Creates an EDA team and returns the same.
       *
       * @returns {Chainable<EdaTeam>}
       */
      createEdaTeam(team?: SetOptional<EdaTeam, 'name' | 'organization_id'>): Chainable<EdaTeam>;

      /**
       * Deletes an EDA team which is provided.
       *
       * @returns {Chainable<EdaTeam>}
       */
      deleteEdaTeam(edaTeamName: EdaTeam): Chainable<void>;

      /**
       * Creates an object to team role assignment.
       *
       * @returns {Chainable<TeamAssignment>}
       */
      createRoleTeamAssignments(
        object_id: string,
        role_definition: number,
        team: number,
        content_type: string
      ): Chainable<void>;

      /**
       * Creates an object to user role assignment.
       *
       * @returns {Chainable<UserAssignment>}
       */
      createRoleUserAssignments(
        object_id: string,
        role_definition: number,
        user: number,
        content_type: string
      ): Chainable<void>;

      /**
       * Creates an object to EDA role definition.
       *
       * @returns {Chainable<RoleDefinition>}
       */
      createEdaRoleDefinition(
        roleName: string,
        description: string,
        content_type,
        permissions
      ): Chainable<RoleDefinition>;

      deleteEdaRoleDefinition(edaRoleDefinition: RoleDefinition): Chainable<void>;

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
      deleteEdaDecisionEnvironment(
        decisionEnvironment: EdaDecisionEnvironment,
        options?: {
          /** Whether to fail on response codes other than 2xx and 3xx */
          failOnStatusCode?: boolean;
        }
      ): Chainable<void>;
      waitEdaDESync(edaDE: EdaDecisionEnvironment): Chainable<EdaDecisionEnvironment>;

      // ==============================================================================================================
      // HUB Commands
      // ==============================================================================================================

      // HUB Request Commands
      createHubTeam(): Cypress.Chainable<HubTeam>;
      deleteHubTeam(
        hubTeam: HubTeam,
        options?: {
          /** Whether to fail on response codes other than 2xx and 3xx */
          failOnStatusCode?: boolean;
        }
      ): Cypress.Chainable<void>;
      createHubUser(hubUser?: HubUser): Cypress.Chainable<HubUser>;
      deleteHubUser(
        hubUser: HubUser,
        options?: {
          /** Whether to fail on response codes other than 2xx and 3xx */
          failOnStatusCode?: boolean;
        }
      ): Cypress.Chainable<void>;
      hubRequest<T>(options: HubRequestOptions): Cypress.Chainable<Response<T>>;

      hubGetRequest<T>(options: HubGetRequestOptions): Cypress.Chainable<Response<T>>;
      hubPutRequest<T>(
        options: HubPutRequestOptions
      ): Cypress.Chainable<Response<T> | Response<Task>>;
      hubPatchRequest<T>(
        options: HubPatchRequestOptions
      ): Cypress.Chainable<Response<T> | Response<Task>>;
      hubPostRequest<T>(
        options: HubPostRequestOptions
      ): Cypress.Chainable<Response<T> | Response<Task>>;
      hubDeleteRequest<T>(
        options: HubDeleteRequestOptions
      ): Cypress.Chainable<Response<T> | Response<Task>>;
      waitOnHubTask(taskUrl: string): Cypress.Chainable<Task>;
      waitForAllTasks(): Cypress.Chainable<void>;

      // HUB Execution Environment Commands
      queryHubExecutionEnvironments(
        options?: HubQueryExecutionEnvironmentsOptions
      ): Cypress.Chainable<Response<HubItemsResponse<HubExecutionEnvironment>>>;
      createHubExecutionEnvironment(
        options: HubCreateExecutionEnvironmentOptions
      ): Cypress.Chainable<HubExecutionEnvironment>;
      deleteHubExecutionEnvironment(
        options: HubDeleteExecutionEnvironmentOptions
      ): Cypress.Chainable<void>;
      syncRemoteExecutionEnvironment(
        executionEnvironment: HubExecutionEnvironment
      ): Cypress.Chainable<void>;

      // HUB Remote Registry Commands
      createHubRemoteRegistry(
        options?: HubCreateRemoteRegistryOptions
      ): Cypress.Chainable<RemoteRegistry>;
      deleteHubRemoteRegistry(options: HubDeleteRemoteRegistryOptions): Cypress.Chainable<void>;

      // HUB Repository Commands
      queryHubRepositories(
        options?: HubQueryRepositoriesOptions
      ): Cypress.Chainable<Response<PulpItemsResponse<Repository>>>;
      createHubRepository(options?: HubCreateRepositoryOptions): Cypress.Chainable<Repository>;
      deleteHubRepository(options: HubDeleteRepositoryOptions): Cypress.Chainable<void>;

      // HUB Repository Distribution Commands
      createHubRepositoryDistribution(
        options?: HubCreateRepositoryDistributionOptions
      ): Cypress.Chainable<HubDistribution>;
      deleteHubRepositoryDistributionByName(name: string): Cypress.Chainable<void>;

      // HUB Namespace Commands
      queryHubNamespaces(
        options?: HubQueryNamespacesOptions
      ): Cypress.Chainable<Response<HubItemsResponse<HubNamespace>>>;
      createHubNamespace(options?: HubCreateNamespaceOptions): Cypress.Chainable<HubNamespace>;
      deleteHubNamespace(options: HubDeleteNamespaceOptions): Cypress.Chainable<void>;

      // HUB Role Commands
      queryHubRoles(
        options?: HubQueryRolesOptions
      ): Cypress.Chainable<Response<PulpItemsResponse<HubRole>>>;
      createHubRole(options?: HubCreateRoleOptions): Cypress.Chainable<HubRole>;
      deleteHubRole(options: HubDeleteRoleOptions): Cypress.Chainable<void>;

      // HUB Remote Commands
      queryHubRemotes(
        options?: HubQueryRemotesOptions
      ): Cypress.Chainable<Response<PulpItemsResponse<HubRemote>>>;
      createHubRemote(options?: HubCreateRemoteOptions): Cypress.Chainable<HubRemote>;
      deleteHubRemote(options: HubDeleteRemoteOptions): Cypress.Chainable<void>;

      // HUB Collection Commands
      getHubCollection(name: string): Cypress.Chainable<CollectionVersionSearch>;
      deleteHubCollection(options: HubDeleteCollectionOptions): Cypress.Chainable<void>;
      deleteHubCollectionByName(name: string): Cypress.Chainable<void>;

      // HUB GalaxyKit Commands
      galaxykit(operation: string, ...args: string[]): Cypress.Chainable<string[]>;

      createApprovedCollection(
        namespaceName: string,
        collectionName: string,
        tags?: string[]
      ): Cypress.Chainable<void>;
      deleteCommunityCollectionFromSystem(
        collection: CollectionVersionSearch,
        options?: {
          /** Whether to fail on response codes other than 2xx and 3xx */
          failOnStatusCode?: boolean;
        }
      ): Cypress.Chainable<void>;
      uploadHubCollectionFile(hubFilePath: string): Cypress.Chainable<void>;
      createNamespace(namespaceName: string): Cypress.Chainable<void>;
      deleteNamespace(namespaceName: string): Cypress.Chainable<void>;
      deleteCollectionsInNamespace(namespaceName: string): Cypress.Chainable<void>;
      cleanupCollections(namespace: string, repo: string): Cypress.Chainable<void>;
      createRemote(remoteName: string, url?: string): Cypress.Chainable<HubRemote>;
      deleteRemote(remoteName: string): Cypress.Chainable<void>;
      createRemoteRegistry(
        remoteRegistryName: string,
        url?: string
      ): Cypress.Chainable<RemoteRegistry>;
      deleteRemoteRegistry(remoteRegistryId: string): Cypress.Chainable<void>;
      deleteCollection(
        collectionName: string,
        namespaceName: string,
        repository: string,
        version?: string,
        options?: {
          /** Whether to fail on response codes other than 2xx and 3xx */
          failOnStatusCode?: boolean;
        }
      ): Cypress.Chainable<void>;
      uploadCollection(
        collection: string,
        namespace: string,
        version?: string
      ): Cypress.Chainable<void>;
      approveCollection(
        collection: string,
        namespace: string,
        version: string
      ): Cypress.Chainable<void>;
      collectionCopyVersionToRepositories(): Cypress.Chainable<void>;
      addAndApproveMultiCollections(thisRange: number): Cypress.Chainable<void>;

      createRepository(repositoryName: string, remoteName?: string): Cypress.Chainable<Repository>;
      deleteRepository(repositoryName: string): Cypress.Chainable<void>;

      undeprecateCollection(
        collectionName: string,
        namespaceName: string,
        repository: string
      ): Cypress.Chainable<void>;

      // ==============================================================================================================
      // END OF COMMANDS
      // ==============================================================================================================
    }
  }
}
