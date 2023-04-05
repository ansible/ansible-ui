/* eslint-disable @typescript-eslint/no-namespace */
// ***********************************************************
// This example support/component.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn offz
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

import '@patternfly/patternfly/patternfly-base.css';

import { Page } from '@patternfly/react-core';
import 'cypress-react-selector';
import { mount } from 'cypress/react18';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { PageFramework } from '../../framework';
import { randomString } from '../../framework/utils/random-string';
import { User } from '../../frontend/awx/interfaces/User';
import { ActiveUserProvider } from '../../frontend/common/useActiveUser';
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Augment the Cypress namespace to include type definitions for
// your custom command.
// Alternatively, can be defined in cypress/support/component.d.ts
// with a <reference path="./component" /> at the top of your spec.
declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
    }
  }
  interface Window {
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    process: any;
  }
}

Cypress.Commands.add('mount', (component, options) => {
  cy.fixture('activeUser').then((activeUser: User) => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/me/',
        hostname: 'localhost',
      },
      {
        activeUser,
      }
    );
  });
  return mount(
    <MemoryRouter initialEntries={['/1']}>
      <PageFramework>
        <ActiveUserProvider>
          <Page>
            <Routes>
              <Route path="/:id" element={component} />
            </Routes>
          </Page>
        </ActiveUserProvider>
      </PageFramework>
    </MemoryRouter>,
    options,
    randomString(8)
  );
});

// Example use:
// cy.mount(<MyComponent />)

before(() => {
  window.process = {
    // To avoid the ReferenceError – process is not defined
    env: {
      NODE_ENV: 'development',
    },
  };
});
