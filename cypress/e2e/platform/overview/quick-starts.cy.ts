import { awxAPI } from '../../../support/formatApiPathForAwx';
import { Settings } from '../../../../frontend/awx/interfaces/Settings';
import { SAAS_URL } from '../../../support/constants';

describe('If SaaS Build', () => {
  before(function () {
    cy.requestGet<Settings>(awxAPI`/settings/system/`).then((data) => {
      const saasBaseUrl = data.TOWER_URL_BASE;
      const parseSaas = saasBaseUrl.split('.').slice(2).join('.').toString();
      if (parseSaas === SAAS_URL) {
        this.skip();
      } else {
        cy.log('Run these tests');
      }
    });
  });

  describe('Overview - Quick Starts', () => {
    beforeEach(() => {
      cy.verifyPageTitle('Welcome to the Ansible Automation Platform');
    });

    it('checks the browse content titles user can see in the hands on quick starts on Automation Hub ', () => {
      cy.navigateTo('platform', 'quickstarts');
      cy.contains('h3 p', 'Finding content in Ansible Automation Platform');
      cy.get('.pfext-markdown-view.pfext-quick-start-tile-description').should(
        'have.text',
        'Build a decision environment.\nPersona: Platform administrator, Automation developerBuild, view, and sync an environment.\nPersona: Platform administrator, Automation developerCreate an organization.\nPersona: Platform AdministratorCreate a team and associate organizations and roles to that team.\nPersona: Platform AdministratorCreate a user and associate organizations, teams, and roles. \nPersona: Platform AdministratorCreate or view a dynamic inventory\nPersona: Platform administratorCreate a project.\nPersona: Platform administrator, Automation developerCreate a rulebook activation.\nPersona: Platform administrator, Automation developerCreate or view an inventory.\nPersona: Platform administrator, Automation developerCreate and run a job or workflow template.\nPersona: Platform administrator, Automation developerViewing execution and decision environments. \nPersona: Anisble OperatorBrowse automation hub collections to find the content that you need.\nPersona: AllLearn how to get started with Ansible Automation Platform.Learn how to get started with Ansible Automation Platform.Learn how to get started with Ansible Automation PlatformExecuting inventories. \nPersona: Ansible operatorExecuting projects.\nPersona: Ansible OperatorReview roles and create new roles as needed by your organization.\nPersona: Platform AdministratorExecuting rulebook activations.\nPersona: Ansible OperatorSet up Ansible Lightspeed with IBM watsonx Code Assistant\nPersona: AllAutomate at scale in a cloud-native way\nPersona: AllLaunching a job template.\nPersona: Ansible Operator'
      );
      cy.get('#finding-content-in-ansible-automation-platform-catalog-tile')
        .click()
        .then(() => {
          cy.get('.pfext-quick-start__base')
            .parentsUntil('pf-v5-c-drawer__main')
            .find('.pf-v5-c-drawer__panel.pf-m-resizable.pfext-quick-start__base')
            .within(() => {
              cy.contains('h2', 'Finding content in Ansible Automation Platform').should(
                'be.visible'
              );
              cy.get('.pfext-quick-start-panel-content__duration').should(
                'contain',
                'Quick start • 5 minutes'
              );
              cy.get('.pfext-quick-start-content .pfext-markdown-view .pf-v5-c-list')
                .children()
                .should('have.length', 4);
              const listElements = [
                'Browse content by repository',
                'Browse content by namespace',
                'Browse content by tag',
                'Browse content by keyword',
              ];
              listElements.forEach((listElement) => {
                cy.get('.pfext-quick-start-content .pfext-markdown-view .pf-v5-c-list').each(() => {
                  cy.contains('li', listElement);
                });
              });
              cy.get('.pfext-quick-start-intro__prereq .pf-v5-c-expandable-section__toggle-text')
                .should('have.text', 'View Prerequisites (1)')
                .click();
              cy.get('.pfext-quick-start-intro__prereq-list').should(
                'contain',
                'You have a valid Ansible Automation Platform subscription.'
              );
              const headerTitles = [
                'Filter content by repository type in the Collections view',
                'Filter content by tag in the Collections view',
                'Filter content by Namespace in the Collections view',
                'Filter content by keyword in the Collections view',
              ];
              headerTitles.forEach((headerTitle) => {
                cy.get('.pfext-quick-start-task-header__list').each(() => {
                  cy.contains('h3', headerTitle);
                });
              });
              cy.get('.pfext-quick-start-panel-content__close-button').click();
            });
        });
    });

    it('task 1 - Filter content by repository type in the Collections view', () => {
      const listItems = [
        'From the navigation panel, select Automation Content > ',
        'From the dropdown menu next to the search field, select ',
        'Next to Repository, select the checkbox corresponding to the repository type that you want.',
        'Scroll through the filtered results and select the collection you want. ',
      ];
      cy.navigateTo('platform', 'quickstarts');
      cy.get('#finding-content-in-ansible-automation-platform-catalog-tile')
        .click()
        .then(() => {
          cy.get('.pfext-quick-start__base')
            .parentsUntil('pf-v5-c-drawer__main')
            .find('.pf-v5-c-drawer__panel.pf-m-resizable.pfext-quick-start__base')
            .within(() => {
              cy.get('.pfext-quick-start-task-header__list')
                .find('.pf-v5-c-wizard__nav-item h3')
                .contains('Filter content by repository type in the Collections view')
                .click();
              cy.get('.pfext-quick-start-tasks__list').within(() => {
                cy.get('h2').should(
                  'have.text',
                  'To filter and browse content by repository type:'
                );
                cy.get('ol.pf-v5-c-list li').should('have.length', 4);
              });
              listItems.forEach((listElement) => {
                cy.get('.pfext-quick-start-tasks__list ol.pf-v5-c-list').each(() => {
                  cy.contains('li', listElement);
                });
              });
              cy.get('h4.pf-v5-c-alert__title').should('contain', 'TIP');
              cy.get('.pf-v5-c-alert__description').should(
                'contain',
                'The repository options refer to the type of content contained in the repository. Rh-certified refers to collections that are maintained and supported by Red Hat; validated refers to content that is maintained but not supported by Red Hat; community refers to content originating from Red Hat’s upstream community; and published refers to content that is available on automation hub but not maintained or supported by Red Hat.'
              );
              cy.get('h4').should('contain', 'Check your work');
              cy.get('.pf-v5-c-alert__description').should(
                'contain',
                'Did you complete the task successfully?'
              );
              cy.get('input#review-success').click();
              cy.contains('.pfext-quick-start-footer  button', 'Next').click();
              cy.contains(
                '.pfext-quick-start-task-header h3',
                'Filter content by tag in the Collections view'
              ).should('be.visible');
              cy.get('.pfext-quick-start-footer .pfext-quick-start-footer__restartbtn').click();
              cy.get('.pfext-quick-start-panel-content__close-button').click();
            });
        });
    });
    it('task 2 - Filter content by tag in the Collections view', () => {
      const listItems = [
        'From the navigation panel, select Automation Content > ',
        'From the dropdown menu next to the search field, select Tag.',
        'Next to Tag, select the checkbox corresponding to the tag that you want to browse.',
      ];
      cy.navigateTo('platform', 'quickstarts');
      cy.get('#finding-content-in-ansible-automation-platform-catalog-tile')
        .click()
        .then(() => {
          cy.get('.pfext-quick-start__base')
            .parentsUntil('pf-v5-c-drawer__main')
            .find('.pf-v5-c-drawer__panel.pf-m-resizable.pfext-quick-start__base')
            .within(() => {
              cy.get('.pfext-quick-start-task-header__list')
                .find('.pf-v5-c-wizard__nav-item h3')
                .contains('Filter content by tag in the Collections view')
                .click();
              cy.get('.pfext-quick-start-tasks__list').within(() => {
                cy.get('h2').should('have.text', 'To filter and browse content by tag:');
                cy.get('ol.pf-v5-c-list li').should('have.length', 4);
              });
              listItems.forEach((listElement) => {
                cy.get('.pfext-quick-start-tasks__list ol.pf-v5-c-list').each(() => {
                  cy.contains('li', listElement);
                });
              });
              cy.get('.pfext-markdown-admonition h4')
                .should('contain', 'TIP')
                .next()
                .should(
                  'contain',
                  'Collections are tagged with descriptive terms that correspond to the collection topic. Usually, the tags describe what the collection automates (for example, infrastructure or security.)'
                );
              cy.get('.pfext-markdown-admonition')
                .should('contain', 'TIP')
                .next()
                .should(
                  'contain',
                  'Scroll through the filtered results and select the collection you want.'
                );
              cy.get('.pfext-quick-start-task-review-alert h4').should(
                'contain',
                'Check your work'
              );
              cy.get('.pf-v5-c-alert__description .pf-v5-c-list li').should(
                'have.text',
                'Do you see a list of collection titles that correspond to the tag you selected?'
              );
              cy.get('input#review-failed').click();
              cy.get('.pf-v5-c-alert__description p').should(
                'contain.text',
                "This task isn't verified yet. Try the task again."
              );
              cy.contains('.pfext-quick-start-footer  button', 'Next').click();
              cy.contains(
                '.pfext-quick-start-task-header h3',
                'Filter content by Namespace in the Collections view'
              ).should('be.visible');
              cy.get('.pfext-quick-start-footer .pfext-quick-start-footer__restartbtn').click();
              cy.get('.pfext-quick-start-panel-content__close-button').click();
            });
        });
    });

    it('task 3 - Filter content by Namespace in the Collections view', () => {
      const listItems = [
        'From the navigation panel, select Automation Content > ',
        'From the dropdown menu next to the search field, select',
        'Enter the namespace you want to search for.',
      ];
      cy.navigateTo('platform', 'quickstarts');
      cy.get('#finding-content-in-ansible-automation-platform-catalog-tile')
        .click()
        .then(() => {
          cy.get('.pfext-quick-start__base')
            .parentsUntil('pf-v5-c-drawer__main')
            .find('.pf-v5-c-drawer__panel.pf-m-resizable.pfext-quick-start__base')
            .within(() => {
              cy.get('.pfext-quick-start-task-header__list')
                .find('.pf-v5-c-wizard__nav-item h3')
                .contains('Filter content by Namespace in the Collections view')
                .click();
              cy.get('.pfext-quick-start-tasks__list').within(() => {
                cy.get('h2').should('have.text', 'To filter and browse content by namespace:');
                cy.get('ol.pf-v5-c-list li').should('have.length', 4);
              });
              listItems.forEach((listElement) => {
                cy.get('.pfext-quick-start-tasks__list ol.pf-v5-c-list').each(() => {
                  cy.contains('li', listElement);
                });
              });
              cy.get('.pfext-markdown-admonition h4')
                .should('contain.text', 'TIP')
                .next()
                .should(
                  'contain.text',
                  'A namespace is a unique location where a provider hosts their content. A namespace will generally refer to a provider name, though a provider may have more than one namespace. Try searching for a provider name (such as Microsoft or Red Hat) first to narrow your search.)'
                );
              cy.get('.pfext-markdown-admonition')
                .should('contain', 'TIP')
                .next()
                .should(
                  'contain.text',
                  'Scroll through the filtered results and select the collection you want.'
                );
              cy.get('.pfext-quick-start-task-review-alert h4').should(
                'contain',
                'Check your work'
              );
              cy.get('.pf-v5-c-alert__description .pf-v5-c-list li').should(
                'have.text',
                'Do you see a list of collection titles that correspond to the namespace you searched for?'
              );
              cy.get('input#review-success').click();
              cy.contains('.pfext-quick-start-footer  button', 'Next').click();
              cy.contains(
                '.pfext-quick-start-task-header h3',
                'Filter content by keyword in the Collections view'
              ).should('be.visible');
              cy.get('.pfext-quick-start-footer .pfext-quick-start-footer__restartbtn').click();
              cy.get('.pfext-quick-start-panel-content__close-button').click();
            });
        });
    });

    it('task 4 - Filter content by keyword in the Collections view', () => {
      const listItems = [
        'From the navigation panel, select Automation Content > ',
        'From the dropdown menu next to the search field, select',
        'Enter your keyword in the search field and click the magnifying glass icon.',
      ];
      cy.navigateTo('platform', 'quickstarts');
      cy.get('#finding-content-in-ansible-automation-platform-catalog-tile')
        .click()
        .then(() => {
          cy.get('.pfext-quick-start__base')
            .parentsUntil('pf-v5-c-drawer__main')
            .find('.pf-v5-c-drawer__panel.pf-m-resizable.pfext-quick-start__base')
            .within(() => {
              cy.get('.pfext-quick-start-task-header__list')
                .find('.pf-v5-c-wizard__nav-item h3')
                .contains('Filter content by keyword in the Collections view')
                .click();
              cy.get('.pfext-quick-start-tasks__list').within(() => {
                cy.get('h2').should('have.text', 'To filter and browse content by keyword:');
                cy.get('ol.pf-v5-c-list li').should('have.length', 4);
              });
              listItems.forEach((listElement) => {
                cy.get('.pfext-quick-start-tasks__list ol.pf-v5-c-list').each(() => {
                  cy.contains('li', listElement);
                });
              });
              cy.get('.pfext-markdown-admonition h4')
                .should('contain.text', 'TIP')
                .next()
                .should(
                  'contain.text',
                  'A keyword can refer to a topic (for example, security or infrastructure), a platform (for example, Delinea or Cisco Intersight), or a provider (for example, IBM or Dell).)'
                );
              cy.get('.pfext-markdown-admonition')
                .should('contain', 'TIP')
                .next('.pf-v5-c-list')
                .should(
                  'contain.text',
                  'Scroll through the filtered results and select the collection you want.'
                );
              cy.get('.pfext-quick-start-task-review-alert h4').should(
                'contain',
                'Check your work'
              );
              cy.get('.pf-v5-c-alert__description .pf-v5-c-list li').should(
                'have.text',
                'Do you see a list of collection titles that correspond to your search term?'
              );
              cy.get('input#review-success').click();
              cy.contains('.pfext-quick-start-footer  button', 'Next').click();
              cy.contains(
                '.pfext-quick-start-task-header h3',
                'Filter content by keyword in the Collections view'
              ).should('be.visible');
              cy.get('.pfext-quick-start-footer .pfext-quick-start-footer__restartbtn').click();
              cy.get('.pfext-quick-start-panel-content__close-button').click();
            });
        });
    });
  });
});
