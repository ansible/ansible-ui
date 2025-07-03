import { AZURE_URL, SAAS_URL } from '../../../support/constants';

describe('If SaaS Build', () => {
  before(function () {
    cy.checkBuildType().then((buildType) => {
      if (buildType === SAAS_URL || buildType === AZURE_URL) {
        cy.log('Test/tests should not run on this deployment.');
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
      cy.contains('Learn Ansible automation with hands-on quickstarts.').should('be.visible');
      const quickstartDescriptions = [
        `Build a decision environment.\nPersona: Platform administrator, Automation developer`,
        `Build, view, and sync an environment.\nPersona: Platform administrator, Automation developer`,
        `Create an organization.`,
        `Create a team and associate organizations and roles to that team.`,
        `Create a user and associate organizations, teams, and roles. \nPersona: Platform Administrator`,
        `Create or view a dynamic inventory\nPersona: Platform administrator`,
        `Create a project.\nPersona: Platform administrator, Automation developer`,
        `Create a rulebook activation.\nPersona: Platform administrator, Automation developer`,
        `Create or view an inventory.\nPersona: Platform administrator, Automation developer`,
        `Create and run a job or workflow template.\nPersona: Platform administrator, Automation developer`,
        `Viewing execution and decision environments. \nPersona: Ansible Operator`,
        `Browse automation hub collections to find the content that you need.\nPersona: All`,
        `Learn how to get started with Ansible Automation Platform.`,
        `Learn how to get started with Ansible Automation Platform.`,
        `Learn how to get started with Ansible Automation Platform`,
        `Executing inventories. \nPersona: Ansible operator`,
        `Executing projects.\nPersona: Ansible Operator`,
        `Review roles and create new roles as needed by your organization.\nPersona: Platform Administrator`,
        `Executing rulebook activations.\nPersona: Ansible Operator`,
        `Set up Ansible Lightspeed with IBM watsonx Code Assistant\nPersona: All`,
        `Automate at scale in a cloud-native way\nPersona: All`,
        `Launching a job template.\nPersona: Ansible Operator`,
      ];
      cy.get('[class*="catalog-item"] [class*="card__body"] [id*="markdown"]')
        .should('have.length', quickstartDescriptions.length)
        .each(($el, index) => {
          expect($el.text().trim()).to.eq(quickstartDescriptions[index]);
        });
      cy.get('button[id="finding-content-in-ansible-automation-platform"]')
        .click({ force: true })
        .then(() => {
          cy.get('[class*="quick-start-catalog__gallery"]')
            .parentsUntil('[class*="drawer__main"]')
            .get('[data-test="quickstart drawer"]')
            .within(() => {
              cy.contains('h2', 'Finding content in Ansible Automation Platform').should(
                'be.visible'
              );
              cy.get('[class*="quick-start-panel-content"]').should(
                'contain',
                'Quick start • 5 minutes'
              );
              cy.get('[class*="quick-start-task"] [class*="content--ul"] li').should(
                'have.length',
                4
              );
              const listElements = [
                'Browse content by repository',
                'Browse content by namespace',
                'Browse content by tag',
                'Browse content by keyword',
              ];
              listElements.forEach((listElement) => {
                cy.get('[class*="quick-start-task"] [class*="content--ul"] li').then(() => {
                  cy.contains('li', listElement);
                });
              });
              cy.get('button[id*="expandable-section-toggle"]')
                .should('have.text', 'View Prerequisites (1)')
                .click();
              cy.get('[class*="content--p"]').should(
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
                cy.get('[class*="quick-start-task"] [class*="wizard__nav-list"] li').then(() => {
                  cy.contains('h3', headerTitle);
                });
              });
              cy.get('[class*="drawer__close"]').click();
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
      cy.get('button[id="finding-content-in-ansible-automation-platform"]')
        .click({ force: true })
        .then(() => {
          cy.get('[class*="quick-start-catalog__gallery"]')
            .parentsUntil('[class*="drawer__main"]')
            .get('[data-test="quickstart drawer"]')
            .within(() => {
              cy.get('[class*="quick-start-task"] [class*="wizard__nav-list"] li')
                .then(() => {
                  cy.contains('h3', 'Filter content by repository type in the Collections view');
                })
                .click();
              cy.get('[class*="quick-start-task-header"] [class*="content--h2"]').should(
                'have.text',
                'To filter and browse content by repository type:'
              );
              cy.get('[class*="quick-start-task-header"] [class*="content--ol"] li').should(
                'have.length',
                4
              );
              listItems.forEach((listElement) => {
                cy.get('[class*="content--ol"] li').then(() => {
                  cy.contains('li', listElement);
                });
              });
              cy.get('h4[class*="alert__title"]').should('contain', 'TIP');

              //Reactivate this assertion when the TIP text is re-added:
              //The following assertion will fail due to missing text in the TIP field:
              // cy.get('[class*="alert__description"]').should(
              //   'contain',
              //   'The repository options refer to the type of content contained in the repository. Rh-certified refers to collections that are maintained and supported by Red Hat; validated refers to content that is maintained but not supported by Red Hat; community refers to content originating from Red Hat’s upstream community; and published refers to content that is available on automation hub but not maintained or supported by Red Hat.'
              // );
              cy.get('[class*="alert"] [class*="alert__title"]').should(
                'contain',
                'Check your work'
              );
              cy.get('[class*="alert"] [class*="content--li"]').should(
                'contain',
                'Did you complete the task successfully?'
              );
              cy.get('input#review-success').click();
              cy.get('[data-testid="qs-drawer-next"]').click();
              cy.get('[class*="quick-start-task-header"] [class*="wizard__nav-link-main"]').should(
                'contain',
                'Filter content by tag in the Collections view'
              );
              cy.get('[data-testid="qs-drawer-side-note-action"]').click();
              cy.get('[class*="drawer__close"]').click();
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
      cy.get('button[id="finding-content-in-ansible-automation-platform"]')
        .click({ force: true })
        .then(() => {
          cy.get('[class*="quick-start-catalog__gallery"]')
            .parentsUntil('[class*="drawer__main"]')
            .get('[data-test="quickstart drawer"]')
            .within(() => {
              cy.get('[class*="quick-start-task"] [class*="wizard__nav-list"] li')
                .then(() => {
                  cy.contains('h3', 'Filter content by tag in the Collections view');
                })
                .click();
              cy.get('[class*="quick-start-task-header"] [class*="content--ol"] li').should(
                'have.length',
                4
              );
              listItems.forEach((listElement) => {
                cy.get('[class*="content--ol"] li').then(() => {
                  cy.contains('li', listElement);
                });
              });
              cy.get('h4[class*="alert__title"]').should('contain', 'TIP');
              cy.get('[class*="content--ol"] li').should(
                'contain',
                'Scroll through the filtered results and select the collection you want.'
              );
              cy.get('[class*="alert"] [class*="alert__title"]').should(
                'contain',
                'Check your work'
              );
              cy.get('[class*="alert"] [class*="content--li"]').should(
                'contain',
                'Do you see a list of collection titles that correspond to the tag you selected?'
              );
              cy.get('input#review-failed').click();
              cy.get('[class*="alert__description"] [class*="content--p"]').should(
                'contain',
                "This task isn't verified yet. Try the task again."
              );
              cy.get('[data-testid="qs-drawer-next"]').click();
              cy.get('[class*="quick-start-task-header"] [class*="wizard__nav-link-main"]').should(
                'contain',
                'Filter content by Namespace in the Collections view'
              );
              cy.get('[class*="quick-start-task-header"] [class*="wizard__nav-link-main"]').should(
                'contain',
                'Filter content by tag in the Collections view'
              );
              cy.get('[data-testid="qs-drawer-side-note-action"]').click();
              cy.get('[class*="drawer__close"]').click();
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
      cy.get('button[id="finding-content-in-ansible-automation-platform"]')
        .click({ force: true })
        .then(() => {
          cy.get('[class*="quick-start-catalog__gallery"]')
            .parentsUntil('[class*="drawer__main"]')
            .get('[data-test="quickstart drawer"]')
            .within(() => {
              cy.get('[class*="quick-start-task"] [class*="wizard__nav-list"] li')
                .then(() => {
                  cy.contains('h3', 'Filter content by Namespace in the Collections view');
                })
                .click();
              cy.get('[class*="quick-start-task-header"] [class*="content--ol"] li').should(
                'have.length',
                4
              );
              listItems.forEach((listElement) => {
                cy.get('[class*="content--ol"] li').then(() => {
                  cy.contains('li', listElement);
                });
              });
              cy.get('h4[class*="alert__title"]').should('contain', 'TIP');
              //Reactivate this assertion when the TIP text is re-added:
              //The following assertion will fail due to missing text in the TIP field:
              // cy.get('[class*="alert__description"]').should(
              //   'contain',
              //   'A namespace is a unique location where a provider hosts their content. A namespace will generally refer to a provider name, though a provider may have more than one namespace. Try searching for a provider name (such as Microsoft or Red Hat) first to narrow your search.)'
              // );
              cy.get('[class*="content--ol"] li').should(
                'contain',
                'Scroll through the filtered results and select the collection you want.'
              );
              cy.get('[class*="alert"] [class*="alert__title"]').should(
                'contain',
                'Check your work'
              );
              cy.get('[class*="alert"] [class*="content--li"]').should(
                'contain',
                'Do you see a list of collection titles that correspond to the namespace you searched for?'
              );
              cy.get('input#review-success').click();
              cy.get('[data-testid="qs-drawer-next"]').click();
              cy.get('[class*="quick-start-task-header"] [class*="wizard__nav-link-main"]').should(
                'contain',
                'Filter content by keyword in the Collections view'
              );
              cy.get('[data-testid="qs-drawer-side-note-action"]').click();
              cy.get('[class*="drawer__close"]').click();
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
      cy.get('button[id="finding-content-in-ansible-automation-platform"]')
        .click({ force: true })
        .then(() => {
          cy.get('[class*="quick-start-catalog__gallery"]')
            .parentsUntil('[class*="drawer__main"]')
            .get('[data-test="quickstart drawer"]')
            .within(() => {
              cy.get('[class*="quick-start-task"] [class*="wizard__nav-list"] li')
                .then(() => {
                  cy.contains('h3', 'Filter content by keyword in the Collections view');
                })
                .click();
              cy.get('[class*="quick-start-task-header"] [class*="content--ol"] li').should(
                'have.length',
                4
              );
              listItems.forEach((listElement) => {
                cy.get('[class*="content--ol"] li').then(() => {
                  cy.contains('li', listElement);
                });
              });
              cy.get('h4[class*="alert__title"]').should('contain', 'TIP');
              //Reactivate this assertion when the TIP text is re-added:
              //The following assertion will fail due to missing text in the TIP field:
              // cy.get('[class*="alert__description"]').should(
              //   'contain',
              //   'A keyword can refer to a topic (for example, security or infrastructure), a platform (for example, Delinea or Cisco Intersight), or a provider (for example, IBM or Dell).)'
              // );
              cy.get('[class*="content--ol"] li').should(
                'contain',
                'Scroll through the filtered results and select the collection you want.'
              );
              cy.get('[class*="alert"] [class*="alert__title"]').should(
                'contain',
                'Check your work'
              );
              cy.get('[class*="alert"] [class*="content--li"]').should(
                'contain',
                'Do you see a list of collection titles that correspond to your search term?'
              );
              cy.get('input#review-success').click();
              cy.get('[data-testid="qs-drawer-next"]').click();
              cy.get('[class*="quick-start-task-header"] [class*="wizard__nav-link-main"]').should(
                'contain',
                'Filter content by keyword in the Collections view'
              );
              cy.get('[data-testid="qs-drawer-side-note-action"]').click();
              cy.get('[class*="drawer__close"]').click();
            });
        });
    });
  });
});
