/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-namespace */
/// <reference types="cypress" />
import '@cypress/code-coverage/support';
import { SetOptional } from 'type-fest';
import { Inventory } from '../../frontend/awx/interfaces/Inventory';
import { Organization } from '../../frontend/awx/interfaces/Organization';
import { Project } from '../../frontend/awx/interfaces/Project';
import { Team } from '../../frontend/awx/interfaces/Team';
import { User } from '../../frontend/awx/interfaces/User';
import {
  Group,
  Host,
  InstanceGroup,
  JobTemplate,
} from '../../frontend/awx/interfaces/generated-from-swagger/api';
import { EdaCredential } from '../../frontend/eda/interfaces/EdaCredential';
import { EdaDecisionEnvironment } from '../../frontend/eda/interfaces/EdaDecisionEnvironment';
import { EdaProject } from '../../frontend/eda/interfaces/EdaProject';
import { EdaRulebook } from '../../frontend/eda/interfaces/EdaRulebook';
import { EdaRulebookActivation } from '../../frontend/eda/interfaces/EdaRulebookActivation';
import { EdaUser } from '../../frontend/eda/interfaces/EdaUser';
import { Label } from '../../frontend/awx/interfaces/Label';
import './rest-commands';
import './auth';
import './eda-commands';
import './awx-commands';
import { LinkHTMLAttributes } from 'react';

declare global {
  namespace Cypress {
    interface Chainable {
      login(
        server: string,
        username: string,
        password: string,
        serverType: string
      ): Chainable<void>;
      edaLogout(): Chainable<EdaUser | undefined>;
      awxLogin(): Chainable<void>;
      edaLogin(): Chainable<void>;

      // NAVIGATION COMMANDS
      navigateTo(label: string | RegExp): Chainable<void>;
      hasTitle(label: string | RegExp): Chainable<void>;

      // --- INPUT COMMANDS ---

      /** Get a FormGroup by it's label. A FormGroup is the PF component that wraps an input and provides a label. */
      getFormGroupByLabel(label: string | RegExp): Chainable<JQuery<HTMLElement>>;

      /** Get an input by it's label. */
      // Searches for an element with a certain label, then asserts that the element is enabled.
      getInputByLabel(label: string | RegExp): Chainable<JQuery<HTMLElement>>;

      /** Get a checkbox by its label */
      getCheckboxByLabel(label: string | RegExp): Chainable<JQuery<HTMLElement>>;

      /** Finds an input by label and types the text into the input .*/
      typeInputByLabel(label: string | RegExp, text: string): Chainable<void>;

      /** Finds a dropdown/select component by its dropdownLabel and clicks on the option specified by dropdownOptionLabel .*/
      selectDropdownOptionByLabel(
        dropdownLabel: string | RegExp,
        dropdownOptionLabel: string
      ): Chainable<void>;

      // TABLE COMMANDS

      /** Change the current filter type in the table toolbar */
      selectToolbarFilterType(filterLabel: string | RegExp): Chainable<void>;

      /** Filter the table using it's current filter by entering text */
      filterTableByText(text: string): Chainable<void>;

      /** Filter the table using specified filter and text. */
      filterTableByTypeAndText(filterLabel: string | RegExp, text: string): Chainable<void>;

      /** Click an action in the table toolbar kebab dropdown actions menu. */
      clickToolbarKebabAction(label: string | RegExp): Chainable<void>;

      /** Get the table row containing the specified text. */
      getTableRowByText(name: string | RegExp, filter?: boolean): Chainable<void>;

      /** Finds a table row containing text and clicks the link inside that row. */
      clickTableRow(name: string | RegExp, filter?: boolean): Chainable<void>;

      /** Finds a table row containing text and clicks action specified by label. */
      clickTableRowKebabAction(
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

      selectTableRow(name: string | RegExp, filter?: boolean): Chainable<void>;

      /**Expands a table row by locating the row using the provided name and thenclicking the "expand-toggle" button on that row*/
      expandTableRow(name: string | RegExp, filter?: boolean): Chainable<void>;

      // --- MODAL COMMANDS ---

      /** Get the active modal dialog. */
      getDialog(): Chainable<void>;

      /** Clicks a button in the active modal dialog. */
      clickModalButton(label: string | RegExp): Chainable<void>;

      /** Clicks the confirm checkbox in the active modal dialog */
      clickModalConfirmCheckbox(): Chainable<void>;

      /** Assert that the active modal dialog contains "Success". */
      assertModalSuccess(): Chainable<void>;

      /** Selects a table row in the active modal dialog, by clicking on the row checkbox. */
      selectTableRowInDialog(name: string | RegExp, filter?: boolean): Chainable<void>;

      // --- DETAILS COMMANDS ---

      clickTab(label: string | RegExp): Chainable<void>;

      /**Asserts that a specific detail term (dt) is displayed and contains text fromthe provided detail description (dd)*/
      hasDetail(detailTerm: string | RegExp, detailDescription: string | RegExp): Chainable<void>;

      clickLink(label: string | RegExp): Chainable<void>;
      clickButton(label: string | RegExp): Chainable<void>;
      clickPageAction(label: string | RegExp): Chainable<void>;

      hasAlert(label: string | RegExp): Chainable<void>;

      hasTooltip(label: string | RegExp): Chainable<void>;

      // --- REST API COMMANDS ---

      /** Sends a request to the API to create a particular resource. */
      requestPost<T>(url: string, data: Partial<T>): Chainable<T>;

      /** Sends a request to the API to get a particular resource. */
      requestGet<T>(url: string): Chainable<T>;

      /** Sends a request to the API to delete a particular resource. */
      requestDelete(url: string, ignoreError?: boolean): Chainable;

      // --- AWX COMMANDS ---
      createAwxOrganization(): Chainable<Organization>;

      /**
       * `createAwxProject` creates an AWX Project via API,
       *  with the name `E2E Project` and appends a random string at the end of the name
       * @returns {Chainable<Project>}
       */
      createAwxProject(): Chainable<Project>;
      createAwxInventory(): Chainable<Inventory>;
      createAwxJobTemplate(): Chainable<JobTemplate>;
      createAwxTeam(organization: Organization): Chainable<Team>;
      createAwxUser(organization: Organization): Chainable<User>;
      createAwxInstanceGroup(): Chainable<InstanceGroup>;
      createAwxLabel(organization: Organization): Chainable<Label>;
      deleteAwxOrganization(organization: Organization): Chainable<void>;
      deleteAwxProject(project: Project): Chainable<void>;
      deleteAwxInventory(inventory: Inventory): Chainable<void>;
      deleteAwxJobTemplate(jobTemplate: JobTemplate): Chainable<void>;
      deleteAwxTeam(team: Team): Chainable<void>;
      deleteAwxUser(user: User): Chainable<void>;
      deleteAwxInstanceGroup(instanceGroup: InstanceGroup): Chainable<void>;
      deleteAwxLabel(label: Label): Chainable<void>;

      createInventoryHostGroup(
        organization: Organization
      ): Chainable<{ inventory: Inventory; host: Host; group: Group }>;

      // --- EDA COMMANDS ---

      checkAnchorLinks(anchorName: string): Chainable<HTMLAnchorElement>;

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
      /**
       * `createEdaProject()` creates an EDA Project via API,
       *  with the name `E2E Project` and appends a random string at the end of the name
       *
       * @returns {Chainable<EdaProject>}
       */
      createEdaProject(): Chainable<EdaProject>;
      getEdaRulebooks(edaProject: EdaProject): Chainable<EdaRulebook[]>;
      getEdaProject(projectName: string): Chainable<EdaProject | undefined>;
      getEdaRulebookActivation(
        edaRulebookActivationName: string
      ): Chainable<EdaRulebookActivation | undefined>;

      waitEdaProjectSync(edaProject: EdaProject): Chainable<EdaProject>;

      getEdaProjectByName(edaProjectName: string): Chainable<EdaProject | undefined>;
      getEdaCredentialByName(edaCredentialName: string): Chainable<EdaCredential | undefined>;

      /**
       * `createEdaRulebookActivation()` creates an EDA Rulebook Activation via API,
       *  with the name `E2E Rulebook Activation` and appends a random string at the end of the name
       *
       * @returns {Chainable<EdaRulebookActivation>}
       */
      createEdaRulebookActivation(
        edaRulebookActivation: SetOptional<Omit<EdaRulebookActivation, 'id'>, 'name'>
      ): Chainable<EdaRulebookActivation>;

      /**
       * `deleteEdaProject(projectName: Project)`
       * deletes an EDA project via API,
       * accepts the project name as parameter
       *
       * @returns {Chainable<void>}
       */
      deleteEdaProject(project: EdaProject): Chainable<void>;

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
      createEdaCredential(): Chainable<EdaCredential>;
      deleteEdaCredential(credential: EdaCredential): Chainable<void>;
      /**
       * Creates an EDA user and returns the same
       *
       * @returns {Chainable<EdaUser>}
       */
      createEdaUser(): Chainable<EdaUser>;

      /**
       * Deletes an EDA user which is provided
       *
       * @returns {Chainable<EdaUser>}
       */
      deleteEdaUser(edaUserName: EdaUser): Chainable<void>;

      /**
       * Retrieves an EDA user and returns the same
       *
       * @returns {Chainable<EdaUser>}
       */

      getEdaUser(): Chainable<EdaUser | undefined>;

      /**
       * Creates a DE and returns the same
       */
      createEdaDecisionEnvironment(): Chainable<EdaDecisionEnvironment>;

      /**
       * Retrieves a DE by name
       */
      getEdaDecisionEnvironmentByName(
        edaDEName: string
      ): Chainable<EdaDecisionEnvironment | undefined>;

      /**
       * Deletes a DE which is provided
       */
      deleteEdaDecisionEnvironment(decisionEnvironment: EdaDecisionEnvironment): Chainable<void>;
      waitEdaDESync(edaDE: EdaDecisionEnvironment): Chainable<EdaDecisionEnvironment>;
    }
  }
}
